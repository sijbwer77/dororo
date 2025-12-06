# apps/message/views.py
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.exceptions import PermissionDenied

from .models import CourseMessageThread, CourseMessage
from .serializers import (
    CourseMessageSerializer,
    CourseMessageThreadListSerializer,
    CourseMessageThreadDetailSerializer,
    CreateThreadSerializer,
    ReplyMessageSerializer,
)

from apps.users.models import LocalAccount  # 경로는 실제 프로젝트에 맞게

def get_user_role(user):
    """
    현재 로그인 유저의 역할 코드(SP, MG)를 반환
    """
    local = getattr(user, "local_account", None)
    if not local:
        return None
    return local.role


class CourseMessageThreadListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        qs = CourseMessageThread.objects.filter(course_id=course_id)

        role = get_user_role(request.user)

        if role == LocalAccount.Role.STUDENT_PARENT:
            # 학생/학부모는 본인이 만든 스레드만
            qs = qs.filter(creator=request.user)
        elif role == LocalAccount.Role.MANAGER:
            # 매니저 = 강사 역할까지 다 보는 계정 → 해당 코스 스레드 전부
            pass
        else:
            # 정의되지 않은 역할이면 아무 것도 안 보여줌
            qs = qs.none()

        serializer = CourseMessageThreadListSerializer(
            qs,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class MessageThreadDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        thread = get_object_or_404(CourseMessageThread, pk=pk)
        role = get_user_role(user)

        if role == LocalAccount.Role.STUDENT_PARENT and thread.creator_id != user.id:
            # 학생이 남의 스레드 보려 하면 막기
            raise PermissionDenied("본인의 메시지만 조회할 수 있습니다.")
        # 매니저(MG)는 그냥 통과
        return thread

    def get(self, request, pk):
        thread = self.get_object(pk, request.user)

        CourseMessage.objects.filter(
            thread=thread, is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        serializer = CourseMessageThreadDetailSerializer(
            thread,
            context={"request": request},
        )
        return Response(serializer.data)


class MessageThreadReplyAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_thread(self, pk, user):
        thread = get_object_or_404(CourseMessageThread, pk=pk)
        role = get_user_role(user)

        if role == LocalAccount.Role.STUDENT_PARENT and thread.creator_id != user.id:
            raise PermissionDenied("본인의 메시지만 답장할 수 있습니다.")
        # 매니저는 아무 스레드나 답장 가능
        return thread

    def post(self, request, pk):
        thread = self.get_thread(pk, request.user)

        serializer = ReplyMessageSerializer(
            data=request.data,
            context={"request": request, "thread": thread},
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        out = CourseMessageSerializer(
            message,
            context={"request": request},
        )
        return Response(out.data, status=status.HTTP_201_CREATED)


class CourseMessageThreadListAPIView(APIView):
    """
    GET /api/courses/{course_id}/messages/
    - 해당 강의에서 내가 볼 수 있는 메시지 스레드 목록
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        qs = CourseMessageThread.objects.filter(course_id=course_id)

        # 학생이면 본인이 만든 스레드만
        local = getattr(request.user, "localaccount", None)
        if local and getattr(local, "role", "") == "student":
            qs = qs.filter(creator=request.user)

        serializer = CourseMessageThreadListSerializer(
            qs,
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)


class MessageThreadCreateAPIView(APIView):
    """
    POST /api/messages/
    - 새 스레드 + 첫 메시지 생성
    Body: { "course_id": 1, "title": "...", "content": "..." }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateThreadSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        thread = serializer.save()

        out = CourseMessageThreadDetailSerializer(
            thread,
            context={"request": request},
        )
        return Response(out.data, status=status.HTTP_201_CREATED)


class MessageThreadDetailAPIView(APIView):
    """
    GET /api/messages/{id}/
    - 스레드 상세 + 메시지 목록
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        thread = get_object_or_404(CourseMessageThread, pk=pk)

        local = getattr(user, "localaccount", None)
        role = getattr(local, "role", "") if local else ""

        # 학생이면 본인이 만든 스레드만 볼 수 있게
        if role == "student" and thread.creator_id != user.id:
            raise PermissionDenied("본인의 메시지만 조회할 수 있습니다.")

        return thread

    def get(self, request, pk):
        thread = self.get_object(pk, request.user)

        # 상대방이 보낸 안 읽은 메시지 읽음 처리
        CourseMessage.objects.filter(
            thread=thread, is_read=False
        ).exclude(sender=request.user).update(is_read=True)

        serializer = CourseMessageThreadDetailSerializer(
            thread,
            context={"request": request},
        )
        return Response(serializer.data)


class MessageThreadReplyAPIView(APIView):
    """
    POST /api/messages/{id}/reply/
    Body: { "content": "답장 내용" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_thread(self, pk, user):
        thread = get_object_or_404(CourseMessageThread, pk=pk)

        local = getattr(user, "localaccount", None)
        role = getattr(local, "role", "") if local else ""

        if role == "student" and thread.creator_id != user.id:
            raise PermissionDenied("본인의 메시지만 답장할 수 있습니다.")

        return thread

    def post(self, request, pk):
        thread = self.get_thread(pk, request.user)

        serializer = ReplyMessageSerializer(
            data=request.data,
            context={"request": request, "thread": thread},
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        out = CourseMessageSerializer(
            message,
            context={"request": request},
        )
        return Response(out.data, status=status.HTTP_201_CREATED)
