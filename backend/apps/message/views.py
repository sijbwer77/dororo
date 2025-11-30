# apps/message/views.py
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from .models import MessageRoom, Message, MessageRoomMember
from .serializers import (
    MessageRoomListSerializer,
    MessageRoomCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)


class MessageRoomViewSet(viewsets.ModelViewSet):
    """
    /api/chat/rooms/
      GET  : 내가 속한 스레드 목록 (강의별 필터 가능)
      POST : 새 스레드 생성 + 첫 메시지 전송
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = MessageRoom.objects.filter(
            room_members__user=user
        ).distinct()

        course_id = self.request.query_params.get("course")
        if course_id and course_id != "all":
            qs = qs.filter(course_id=course_id)

        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return MessageRoomCreateSerializer
        return MessageRoomListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


class MessageViewSet(viewsets.ModelViewSet):
    """
    /api/chat/messages/
      GET  ?room=<room_id>  : 해당 스레드의 메시지 목록
      POST                  : 해당 스레드에 새 메시지(답장) 작성
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(
            room__room_members__user=user
        ).distinct()

        room_id = self.request.query_params.get("room")
        if room_id:
            qs = qs.filter(room_id=room_id)

        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return MessageCreateSerializer
        return MessageSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        """
        답장 보낼 때:
        - 이 사람이 정말 그 방 멤버인지 확인
        - sender 를 현재 유저로 설정
        """
        room = serializer.validated_data["room"]
        user = self.request.user

        if not MessageRoomMember.objects.filter(room=room, user=user).exists():
            raise PermissionDenied("이 방의 멤버가 아닙니다.")

        message = serializer.save(sender=user)

        # 보낸 사람은 보낸 시점까지는 읽은 걸로 간주 → last_read_at 업데이트
        MessageRoomMember.objects.filter(room=room, user=user).update(
            last_read_at=message.created_at
        )