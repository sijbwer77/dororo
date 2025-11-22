from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from .models import MessageRoom, Message, MessageRoomMember
from .serializers import (
    MessageRoomSerializer,
    MessageRoomCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)


class MessageRoomViewSet(viewsets.ModelViewSet):
    """
    내가 속한 채팅방 목록 / 생성
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 로그인한 유저가 멤버인 방만
        return (
            MessageRoom.objects
            .filter(room_members__user=self.request.user)
            .distinct()
        )

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return MessageRoomCreateSerializer
        return MessageRoomSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MessageViewSet(viewsets.ModelViewSet):
    """
    채팅 메시지 조회/작성
    GET  /api/chat/messages/?room=1
    POST /api/chat/messages/ { "room": 1, "content": "안녕" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Message.objects.all()
        room_id = self.request.query_params.get('room')
        if room_id:
            qs = qs.filter(room_id=room_id)

        # 내가 멤버인 방의 메시지만
        return qs.filter(
            room__room_members__user=self.request.user
        ).distinct()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return MessageCreateSerializer
        return MessageSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def perform_create(self, serializer):
        room = serializer.validated_data['room']
        user = self.request.user

        # 방 멤버인지 확인
        if not MessageRoomMember.objects.filter(room=room, user=user).exists():
            raise PermissionDenied('이 방의 멤버가 아닙니다.')

        serializer.save(sender=user)
