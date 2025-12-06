# apps/schedule/models.py
from django.db import models
from django.conf import settings

class ScheduleEvent(models.Model):
    STATUS_CHOICES = [
        ("planned", "예정"),
        ("done", "완료"),
        ("cancelled", "취소"),
    ]

    TYPE_CHOICES = [
        ("personal", "개인 일정"),
        ("course", "강의 일정"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="schedule_events",
    )
    title = models.CharField("제목", max_length=100)
    description = models.TextField("설명", blank=True)

    date = models.DateField("날짜")
    start_time = models.TimeField("시작 시간", null=True, blank=True)
    end_time = models.TimeField("종료 시간", null=True, blank=True)

    type = models.CharField(
        "일정 종류",
        max_length=20,
        choices=TYPE_CHOICES,
        default="personal",
    )
    status = models.CharField(
        "상태",
        max_length=20,
        choices=STATUS_CHOICES,
        default="planned",
    )

    # 강의 일정일 때 캘린더에 같이 보여주기 위한 정보 (선택)
    course_id = models.IntegerField("코스 ID", null=True, blank=True)
    course_name = models.CharField("코스 이름", max_length=100, blank=True)
    course_color = models.CharField(
        "코스 색상",
        max_length=7,
        blank=True,
        help_text="#RRGGBB 형식 (예: #FF6B6B)",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time", "id"]

    def __str__(self):
        return f"{self.date} {self.title}"
