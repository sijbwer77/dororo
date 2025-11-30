from django.conf import settings
from django.db import models


class GamificationProfile(models.Model):
    """
    한 유저의 게이미피케이션 상태 요약.
    - total_score : 출석/과제/문제풀이로 계산된 누적 점수 (0 ~ 4200)
    - stage / step : STAGE 1~2, STEP 1~5 (6은 all clear 화면)
    - progress : 전체 진행률 (0.0 ~ 1.0)
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gamification_profile",
    )

    total_score = models.PositiveIntegerField(default=0)
    stage = models.PositiveSmallIntegerField(default=1)
    step = models.PositiveSmallIntegerField(default=1)
    progress = models.FloatField(default=0.0)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = "gamification_profile"

    def __str__(self):
        return f"{self.user} / {self.total_score}점 (stage {self.stage}, step {self.step})"


class DailyLmsAccess(models.Model):
    """
    LMS 접속 / 출석 도장 상태.

    - has_accessed : 그 날짜에 LMS에 한 번이라도 접속했는지
    - is_checked   : 출석 도장을 눌러서 출석 인정했는지
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="daily_lms_accesses",
    )
    date = models.DateField()

    has_accessed = models.BooleanField(default=False)
    is_checked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = "daily_lms_access"
        unique_together = ("user", "date")

    def __str__(self):
        return f"{self.user} / {self.date} / accessed={self.has_accessed}, checked={self.is_checked}"
