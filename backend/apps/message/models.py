# apps/message/models.py
from django.db import models
from django.contrib.auth.models import User
from apps.learning.models import Course  # Course 위치에 맞게 수정

class CourseMessageThread(models.Model):
    """
    강의 안에서 오가는 1건의 문의(스레드)
    ex) "과제 제출 기한 문의드립니다"
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="message_threads",
    )
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_message_threads",
    )
    title = models.CharField(max_length=200)
    is_closed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"[{self.course_id}] {self.title}"


class CourseMessage(models.Model):
    """
    스레드 안에 실제로 오가는 메시지(대화 한 줄)
    """
    thread = models.ForeignKey(
        CourseMessageThread,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_course_messages",
    )
    content = models.TextField()

    # 나중에 파일 첨부 붙이고 싶으면 사용
    attachment = models.FileField(
        upload_to="course_messages/",
        null=True,
        blank=True,
    )

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.thread_id} - {self.sender.username}: {self.content[:20]}"
