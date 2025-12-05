from dataclasses import dataclass
import logging

import requests
from django.db import transaction
from django.utils import timezone

from apps.learning.models import Submission

from .constants import (
    MAX_SCORE,
    LEVEL_TABLE,
    ATTENDANCE_POINT,
    ASSIGNMENT_POINT,
    PROBLEM_POINT,
)
from .models import GamificationProfile, DailyLmsAccess, SolvedAcProgress

logger = logging.getLogger(__name__)


# ---------- 데이터 구조 ----------


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
    if score < 0:
        score = 0
    if score > MAX_SCORE:
        score = MAX_SCORE
    return score


def get_stage_step(score: int) -> tuple[int, int]:
    """
    점수로 STAGE / STEP 계산
    """
    if score <= 0:
        # 아직 아무것도 안 했으면 기본값
        return 1, 1

    for stage, step, min_s, max_s in LEVEL_TABLE:
        if min_s <= score <= max_s:
            return stage, step

    # 혹시 4200 초과하면 마지막 구간으로
    last_stage, last_step, *_ = LEVEL_TABLE[-1]
    return last_stage, last_step


def get_step_bounds(stage: int, step: int) -> tuple[int, int]:
    """
    해당 STAGE/STEP의 점수 최소/최대 반환
    """
    for s, st, min_s, max_s in LEVEL_TABLE:
        if s == stage and st == step:
            return min_s, max_s

    # 못 찾으면 마지막 구간
    *_, min_s, max_s = LEVEL_TABLE[-1]
    return min_s, max_s


# ---------- 카운트 계산 ----------


def get_attendance_count(user) -> int:
    """
    출석(도장 찍은 날) 개수
    """
    return DailyLmsAccess.objects.filter(
        user=user,
        is_checked=True,
    ).count()


def get_assignment_count(user) -> int:
    """
    과제 제출 개수
    (필요하면 Submission 필터 조건은 너 프로젝트 상황에 맞게 수정해도 됨)
    """
    return Submission.objects.filter(
        student=user,
        status="submitted",
    ).count()


# ---------- solved.ac 연동 ----------

SOLVEDAC_USER_API = "https://solved.ac/api/v3/user/show"


def _fetch_solvedac_profile(handle: str) -> dict | None:
    """
    solved.ac 에서 유저 프로필 JSON 가져오기.
    실패 시 None 리턴.
    """
    try:
        resp = requests.get(
            SOLVEDAC_USER_API,
            params={"handle": handle},
            timeout=3,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.warning("solved.ac request failed: %s", exc, extra={"handle": handle})
        return None

    try:
        return resp.json()
    except ValueError as exc:
        logger.warning("solved.ac invalid JSON: %s", exc, extra={"handle": handle})
        return None


def get_solved_problem_count(user) -> int:
    """
    solved.ac 연동으로 '연동 이후 새로 푼 문제들의 총합'을 계산한다.

    - user.local_account.solvedac_handle 에서 핸들 가져옴
    - solved.ac /api/v3/user/show 로 현재 solvedCount 읽음
      (공식 비공식 문서 참고: solvedCount 필드 사용)
    - SolvedAcProgress:
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

    handle = getattr(local, "solvedac_handel", None)
    if not handle:
        return 0

    # 1) solved.ac 에서 현재 solvedCount 읽기
    data = _fetch_solvedac_profile(handle)
    if data is None:
        # API 실패 시: 이미 인정된 점수만 유지
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
            # 처음 연동 시:
            #   - baseline_solved_count = 현재까지 푼 문제 수
            #   - last_solved_count     = 현재값
            #   - credited_solved_count = 0 (연동 전에 푼 건 점수 X)
            "baseline_solved_count": current_solved,
            "last_solved_count": current_solved,
            "credited_solved_count": 0,
            "last_handle": handle,
        },
    )

    # 방금 새로 만든 거라면, 아직 인정된 문제 개수는 0
    if created:
        return progress.credited_solved_count

    # 3) 기존 row가 있는 경우 처리

    # (1) 핸들이 변경된 경우:
    #     - 기존 credited_solved_count 는 유지
    #     - baseline/last_solved_count 를 새 핸들의 현재 solvedCount 로 맞춰주고
    #       그 시점부터 새로 푼 문제만 추가로 인정
    if progress.last_handle and progress.last_handle != handle:
        progress.last_handle = handle
        progress.baseline_solved_count = current_solved
        progress.last_solved_count = current_solved
        progress.save(
            update_fields=[
                "last_handle",
                "baseline_solved_count",
                "last_solved_count",
                "updated_at",
            ]
        )
        return progress.credited_solved_count

    # (2) 같은 핸들이면 증가분만 계산
    delta = current_solved - progress.last_solved_count
    if delta < 0:
        # solved.ac 상의 값이 줄어든 경우(거의 없겠지만) 점수는 깎지 않음
        delta = 0

    if delta > 0:
        progress.credited_solved_count += delta

    progress.last_solved_count = current_solved
    progress.last_handle = handle
    progress.save(
        update_fields=[
            "credited_solved_count",
            "last_solved_count",
            "last_handle",
            "updated_at",
        ]
    )

    return progress.credited_solved_count


# ---------- 프로필 업데이트 + 상태 dict ----------


@transaction.atomic
def update_profile_and_build_status(user) -> dict:
    """
    1) 출석/과제/백준 문제 수 카운트
    2) 점수 / 레벨 / EXP 계산
    3) GamificationProfile 업데이트
    4) 프론트에 내려줄 dict 리턴
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

    # 전체 진행률 (0.0 ~ 1.0)
    if MAX_SCORE > 0:
        global_progress = total_score / MAX_SCORE
    else:
        global_progress = 0.0

    if global_progress < 0:
        global_progress = 0.0
    if global_progress > 1:
        global_progress = 1.0

    # STEP 내 EXP 계산
    if is_clear:
        # 올클리어면 그냥 마지막 구간을 꽉 채운 걸로 본다
        min_s, max_s = get_step_bounds(2, 5)
        step_exp_max = max_s - min_s
        step_exp_current = step_exp_max
    else:
        min_s, max_s = get_step_bounds(stage, step)
        step_exp_max = max(max_s - min_s, 1)
        step_exp_current = total_score - min_s
        if step_exp_current < 0:
            step_exp_current = 0
        if step_exp_current > step_exp_max:
            step_exp_current = step_exp_max

    # GamificationProfile 저장/업데이트
    profile, created = GamificationProfile.objects.get_or_create(
        user=user,
        defaults={
            "total_score": total_score,
            "stage": stage,
            "step": step,
            "progress": global_progress,
        },
    )

    if not created:
        profile.total_score = total_score
        profile.stage = stage
        profile.step = step
        profile.progress = global_progress
        profile.save(
            update_fields=[
                "total_score",
                "stage",
                "step",
                "progress",
                "updated_at",
            ]
        )

    return {
        "total_score": total_score,
        "max_score": MAX_SCORE,
        "stage": stage,
        "step": step,
        "global_progress": global_progress,
        "step_exp_current": step_exp_current,
        "step_exp_max": step_exp_max,
        "is_clear": is_clear,
        # 디버깅/표시용 서브 정보
        "attendance_count": attendance_count,
        "assignment_count": assignment_count,
        "solved_problem_count": solved_problem_count,
    }


# ---------- LMS 접속 트래킹 ----------


def track_lms_access(user, date=None) -> DailyLmsAccess:
    """
    그날 LMS에 접속했다는 사실을 기록해 두는 유틸.

    - date 생략 시: 오늘 날짜
    - 이미 row 있으면 has_accessed=True 로만 업데이트
    """
    if date is None:
        date = timezone.now().date()

    obj, _ = DailyLmsAccess.objects.get_or_create(
        user=user,
        date=date,
        defaults={"has_accessed": True, "is_checked": False},
    )

    if not obj.has_accessed:
        obj.has_accessed = True
        obj.save(update_fields=["has_accessed", "updated_at"])

    return obj
