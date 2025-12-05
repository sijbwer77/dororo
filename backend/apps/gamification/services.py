from dataclasses import dataclass

from django.db import transaction
from django.utils import timezone

import logging
import requests

logger = logging.getLogger(__name__)


from .constants import (
    MAX_SCORE,
    LEVEL_TABLE,
    ATTENDANCE_POINT,
    ASSIGNMENT_POINT,
    PROBLEM_POINT,
)
from .models import GamificationProfile, DailyLmsAccess, SolvedAcProgress

from django.db.models import Q
from apps.learning.models import Submission


@dataclass
class ScoreSource:
    """
    점수 계산에 사용되는 원자료 개수
    """
    attendance_count: int
    assignment_count: int
    solved_problem_count: int


# ---------- 점수 / 레벨 계산 ----------


def calc_total_score(source: ScoreSource) -> int:
    """
    출석/과제/문제풀이 개수로 총 점수 계산 + 4200점 CAP
    """
    score = (
        source.attendance_count * ATTENDANCE_POINT
        + source.assignment_count * ASSIGNMENT_POINT
        + source.solved_problem_count * PROBLEM_POINT
    )
    return min(score, MAX_SCORE)


def get_stage_step(score: int) -> tuple[int, int]:
    """
    점수로 STAGE / STEP 결정.
    score <= 0 이면 STAGE 1 / STEP 1
    """
    if score <= 0:
        return 1, 1

    for stage, step, min_s, max_s in LEVEL_TABLE:
        if min_s <= score <= max_s:
            return stage, step

    # 혹시 4200 초과하면 마지막 구간으로
    return 2, 5


def get_step_bounds(stage: int, step: int) -> tuple[int, int]:
    """
    해당 STAGE/STEP의 점수 최소/최대 반환
    (STEP 6 = all clear 는 전체 범위로)
    """
    if stage == 2 and step == 6:
        return 0, MAX_SCORE

    for st, sp, min_s, max_s in LEVEL_TABLE:
        if st == stage and sp == step:
            return min_s, max_s

    return 0, MAX_SCORE


def calc_step_exp(score: int, stage: int, step: int) -> tuple[int, int]:
    """
    EXP 바에 들어갈 숫자 계산 (예: 178 / 200)
    여기서는 step 구간 길이만큼 max, 그 안에서 현재 위치를 cur로 사용.
    """
    min_s, max_s = get_step_bounds(stage, step)
    if max_s <= min_s:
        return 0, 0

    clamped = max(min(score, max_s), min_s)
    cur = clamped - min_s
    max_ = max_s - min_s
    return cur, max_


# ---------- 실제 개수 카운트 ----------


def get_attendance_count(user) -> int:
    """
    출석 점수 = 출석 도장을 찍은 날 개수.
    (is_checked=True 인 날만 카운트)
    """
    return DailyLmsAccess.objects.filter(
        user=user,
        is_checked=True,
    ).count()


def get_assignment_count(user) -> int:
    return Submission.objects.filter(
        student=user,
        status='submitted',
    ).count()

def get_solved_problem_count(user) -> int:
    """
    solved.ac 연동으로 '연동 이후 새로 푼 문제들의 총합'을 계산한다.

    - LocalAccount.solvedac_handle 에서 핸들 가져옴
    - solved.ac /api/v3/user/show 로 현재 solvedCount 읽음
    - SolvedAcProgress 에서:
        * credited_solved_count : 지금까지 점수로 인정된 문제 개수 (절대 줄어들지 않음)
        * last_solved_count     : 마지막으로 본 solvedCount
        * last_handle           : 마지막으로 사용한 solved.ac 핸들
    - 같은 핸들이면 증가분만 더해주고,
      핸들이 바뀌면 기존 점수 유지 + 새 핸들은 그 시점부터 다시 카운트.
    """
    # 0) 핸들 없는 계정은 0
    local = getattr(user, "local_account", None)
    if local is None:
        return 0

    handle = getattr(local, "solvedac_handle", None)
    if not handle:
        return 0

    # 1) solved.ac API 호출
    try:
        resp = requests.get(
            "https://solved.ac/api/v3/user/show",
            params={"handle": handle},
            timeout=3,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        logger.warning(
            "solved.ac 요청 실패 user_id=%s handle=%s error=%s",
            getattr(user, "id", None),
            handle,
            exc,
        )
        # 실패해도 점수는 줄어들면 안 되므로, 그냥 기존 credited 값만 사용
        progress = getattr(user, "solvedac_progress", None)
        if progress is None:
            return 0
        return progress.credited_solved_count

    try:
        current_solved = int(data.get("solvedCount") or 0)
    except (TypeError, ValueError):
        current_solved = 0

    if current_solved < 0:
        current_solved = 0

    # 2) progress row 가져오기 (없으면 생성)
    progress, created = SolvedAcProgress.objects.get_or_create(
        user=user,
        defaults={
            "baseline_solved_count": current_solved,
            "last_solved_count": current_solved,
            "credited_solved_count": 0,
            "last_handle": handle,
        },
    )

    # 최초 생성이면: 연동 이전 푼 문제는 제외, 점수 0부터 시작
    if created:
        return 0

    # 3) 기존 row 있는데 last_solved_count가 0이고 credited도 0이면
    #    (예전 버전에서 baseline만 쓰다가 필드 추가한 경우 같은 상태)
    if progress.last_solved_count == 0 and progress.credited_solved_count == 0:
        progress.baseline_solved_count = current_solved
        progress.last_solved_count = current_solved
        progress.last_handle = handle
        progress.save(update_fields=[
            "baseline_solved_count",
            "last_solved_count",
            "last_handle",
            "updated_at",
        ])
        return 0

    # 4) 핸들이 바뀐 경우: 기존 점수 유지, 새 핸들은 이 시점부터 다시 시작
    if progress.last_handle and progress.last_handle != handle:
        progress.last_handle = handle
        progress.last_solved_count = current_solved
        # baseline_solved_count 는 디버깅용이라 유지해도 되고, 새 값으로 덮어써도 됨
        progress.save(update_fields=["last_handle", "last_solved_count", "updated_at"])
        return progress.credited_solved_count

    # 5) 같은 핸들인 경우: 증가분만 추가
    delta = current_solved - progress.last_solved_count
    if delta > 0:
        progress.credited_solved_count += delta

    # 점수는 줄어들면 안 되므로 delta <= 0 이면 아무 것도 안 함
    progress.last_solved_count = current_solved
    progress.last_handle = handle
    progress.save(update_fields=[
        "credited_solved_count",
        "last_solved_count",
        "last_handle",
        "updated_at",
    ])

    return progress.credited_solved_count


# ---------- 프로필 업데이트 + 상태 dict ----------


@transaction.atomic
def update_profile_and_build_status(user) -> dict:
    """
    1) 출석/과제/문제풀이 개수 카운트
    2) 총 점수 / STAGE / STEP / EXP 계산
    3) GamificationProfile 업데이트
    4) 프론트용 dict 리턴
    """
    attendance_count = get_attendance_count(user)
    assignment_count = get_assignment_count(user)
    solved_problem_count = get_solved_problem_count(user)

    source = ScoreSource(
        attendance_count=attendance_count,
        assignment_count=assignment_count,
        solved_problem_count=solved_problem_count,
    )

    total_score = calc_total_score(source)
    stage, step = get_stage_step(total_score)

    is_clear = total_score >= MAX_SCORE
    if is_clear:
        # 올클리어 화면: STAGE 2 / STEP 6
        stage, step = 2, 6

    step_exp_current, step_exp_max = calc_step_exp(total_score, stage, step)

    profile, _ = GamificationProfile.objects.select_for_update().get_or_create(
        user=user
    )
    profile.total_score = total_score
    profile.stage = stage
    profile.step = step
    profile.progress = total_score / MAX_SCORE if MAX_SCORE else 0.0
    profile.save()

    return {
        "total_score": total_score,
        "max_score": MAX_SCORE,
        "stage": stage,
        "step": step,
        "global_progress": profile.progress,  # 0.0 ~ 1.0
        "step_exp_current": step_exp_current,
        "step_exp_max": step_exp_max,
        "is_clear": is_clear,
    }


# ---------- LMS 접속 트래킹 헬퍼 ----------


def track_lms_access(user, date=None) -> DailyLmsAccess:
    """
    유저가 LMS에 접속했을 때 (로그인 후 / 메인 학습페이지 진입 시)
    한 번만 호출해주면 됨.
    - row가 없으면 생성 + has_accessed=True
    - 있으면 has_accessed만 True로 세팅
    """
    if date is None:
        date = timezone.now().date()

    obj, _ = DailyLmsAccess.objects.get_or_create(
        user=user,
        date=date,
        defaults={"has_accessed": True},
    )

    if not obj.has_accessed:
        obj.has_accessed = True
        obj.save(update_fields=["has_accessed", "updated_at"])

    return obj