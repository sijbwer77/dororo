from django.db import models
from django.conf import settings


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class MessageRoom(TimeStampedModel):
    """
    채팅방 (1:1, 그룹 공용)
    """
    name = models.CharField(max_length=100, blank=True)

    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='MessageRoomMember',
        related_name='message_rooms',
    )

    class Meta:
        db_table = 'message_room'

    def __str__(self):
        return self.name or f"Room {self.id}"


class MessageRoomMember(TimeStampedModel):
    """
    방-유저 매핑 + (나중에) 마지막 읽은 시간
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
        db_table = 'message_room_member'
        unique_together = ('room', 'user')

    def __str__(self):
        return f"{self.room_id} - {self.user_id}"


class Message(TimeStampedModel):
    """
    실제 채팅 메시지 (텍스트만, 파일 X)
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
        db_table = 'message'
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.room_id}] {self.sender_id}: {self.content[:20]}"
