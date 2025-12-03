from django.conf import settings
from django.db import models


class GamificationProfile(models.Model):
    """
    한 유저의 게이미피케이션 상태 요약.
    - total_score : 출석/과제/문제풀이로 계산된 누적 점수 (0 ~ 4200)
    - stage / step : STAGE 1~2, STEP 1~5 (6은 all clear 화면)
    - progress : 전체 진행률 (0.0 ~ 1.0)
    """

    user = models.OneToOneField( #한 유저당 딱 1개만 가질 수 있다
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, #유저가 삭제되면 이 프로필 같이 삭제
        related_name="gamification_profile", #이걸로 역참조 가능
    )

    total_score = models.PositiveIntegerField(default=0) #0이상의 정수만 허용
    stage = models.PositiveSmallIntegerField(default=1)
    step = models.PositiveSmallIntegerField(default=1)
    progress = models.FloatField(default=0.0) #실수를 저장(진행률을 저장하니까 실수형)

    created_at = models.DateTimeField(auto_now_add=True, editable=False) #admin에서 수정 못한다
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = "gamification_profile" #실제 db에서의 이름

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
        related_name="daily_lms_accesses", #역참조 가능 -> user에서 daily_lms_... 참조 가능하다
    )
    date = models.DateField() #연 월 일 저장

    has_accessed = models.BooleanField(default=False) #lms에 한번이라도 접속했는지
    is_checked = models.BooleanField(default=False) #그 날짜에 출석도장을 눌렀는지

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = "daily_lms_access"
        unique_together = ("user", "date") #다른 열에 중복되면 안된다 -> 한 유저가 같은날에 또 만들 수 없음

    def __str__(self):
        return f"{self.user} / {self.date} / accessed={self.has_accessed}, checked={self.is_checked}"
    
class SolvedAcProgress(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="solvedac_progress",
    )

    # 처음 연동했을 때 solved.ac 값 (디버깅용 / 정보용)
    baseline_solved_count = models.PositiveIntegerField(default=0)

    # 마지막으로 solved.ac에서 읽어온 solvedCount
    last_solved_count = models.PositiveIntegerField(default=0)

    # 지금까지 "게이미피케이션 점수로 인정된 문제 개수"
    #  → 이 숫자만큼은 평생 유지, 절대 줄어들지 않음
    credited_solved_count = models.PositiveIntegerField(default=0)

    # 마지막으로 동기화할 때 사용한 핸들 (핸들 변경 감지용)
    last_handle = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        db_table = "solvedac_progress"
