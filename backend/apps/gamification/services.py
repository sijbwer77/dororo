from dataclasses import dataclass

from django.db import transaction
from django.utils import timezone

from .constants import (
    MAX_SCORE,
    LEVEL_TABLE,
    ATTENDANCE_POINT,
    ASSIGNMENT_POINT,
    PROBLEM_POINT,
)
from .models import GamificationProfile, DailyLmsAccess

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
    solved.ac 연동으로 푼 문제 수.
    TODO: 나중에 백준 핸들이랑 연결해서 구현.
    """
    return 0


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