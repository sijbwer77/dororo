from django.conf import settings
from django.db import models


class Consultation(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "진행 중"
        DONE = "DONE", "완료"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="consultations",
    )
    title = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
    )
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-last_message_at", "-created_at"]

    def __str__(self):
        return f"{self.title or '무제 상담'} ({self.get_status_display()})"


class ConsultationMessage(models.Model):
    class SenderType(models.TextChoices):
        STUDENT = "student", "학생"
        ADMIN = "admin", "관리자"

    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender_type = models.CharField(
        max_length=20,
        choices=SenderType.choices,
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.sender_type}] {self.text[:30]}"
