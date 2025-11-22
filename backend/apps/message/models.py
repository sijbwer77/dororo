# apps/message/models.py
from django.db import models
from django.conf import settings

from apps.learning.models import Course  # 강의 모델


class TimeStampedModel(models.Model):
    """
    공통 생성/수정 시간
    """
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class MessageRoom(TimeStampedModel):
    """
    ▶ 메시지 스레드(왼쪽 리스트 한 줄)
    - 반드시 한 강의(course)에 속함  ✅ 강의 구분 여기!
    - name = 스레드 제목 (PDF의 '메시지 2' 같은 것)
    - members = 이 스레드에 참여하는 사람들 (보낸 학생, 함께 선택된 학생들, 강사 등 여러 명)
    """
    course = models.ForeignKey(              # ★ 강의별 구분
        Course,
        on_delete=models.CASCADE,
        related_name="message_rooms",
    )
    name = models.CharField(max_length=100)  # 스레드 제목

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='MessageRoomMember',
        related_name='message_rooms',
    )

    class Meta:
        db_table = "message_room"

    def __str__(self):
        return f"[{self.course}] {self.name}"


class MessageRoomMember(TimeStampedModel):
    """
    ▶ 이 스레드에 속한 유저 한 명
    - 학생 / 강사 / 같이 듣는 학생 여러 명 모두 가능
    """
    room = models.ForeignKey(
        MessageRoom,
        on_delete=models.CASCADE,
        related_name='room_members',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='room_memberships',
    )
    last_read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "message_room_member"
        unique_together = ("room", "user")

    def __str__(self):
        return f"{self.room_id} - {self.user_id}"


class Message(TimeStampedModel):
    """
    ▶ 실제 메시지 한 줄 (오른쪽 말풍선 하나)
    - room.course 를 타고 올라가면 이 메시지가 어떤 강의에 속했는지 알 수 있음
    """
    room = models.ForeignKey(
        MessageRoom,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    content = models.TextField()

    class Meta:
        db_table = "message"
        ordering = ["created_at"]  # 옛날 → 최신 순

    def __str__(self):
        return f"[{self.room_id}] {self.sender_id}: {self.content[:20]}"
