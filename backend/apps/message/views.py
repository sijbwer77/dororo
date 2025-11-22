# apps/message/views.py
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import CourseMessage, CourseMessageRecipient
from .serializers import (
    MessageListSerializer,
    MessageDetailSerializer,
    MessageCreateSerializer,
)


class CourseMessageViewSet(viewsets.GenericViewSet):
    """
    /api/chat/messages/
      GET  : 메일함 리스트 (강의별, 받은/보낸 선택)
      POST : 메일 보내기
    /api/chat/messages/<id>/
      GET  : 메일 상세 + 읽음 처리
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        box = self.request.query_params.get("box", "inbox")  # inbox / sent
        course_id = self.request.query_params.get("course")

        if box == "sent":
            qs = CourseMessage.objects.filter(
                sender=user,
                is_deleted_by_sender=False,
            )
        else:  # inbox
            links = CourseMessageRecipient.objects.filter(
                recipient=user,
                deleted_from_inbox=False,
            )
            qs = CourseMessage.objects.filter(recipient_links__in=links)

        if course_id and course_id != "all":
            qs = qs.filter(course_id=course_id)

        return qs.distinct()

    # ------- list (메일함 목록) -------
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = MessageListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    # ------- retrieve (상세 보기 + 읽음 처리) -------
    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            message = self.get_queryset().get(pk=pk)
        except CourseMessage.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # 내가 받은 메일이면 읽음 처리
        try:
            link = CourseMessageRecipient.objects.get(
                message=message, recipient=request.user
            )
            if not link.is_read:
                link.is_read = True
                link.read_at = timezone.now()
                link.save()
        except CourseMessageRecipient.DoesNotExist:
            pass

        serializer = MessageDetailSerializer(message, context={"request": request})
        return Response(serializer.data)

    # ------- create (메일 보내기) -------
    def create(self, request, *args, **kwargs):
        serializer = MessageCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        detail = MessageDetailSerializer(message, context={"request": request})
        return Response(detail.data, status=status.HTTP_201_CREATED)
