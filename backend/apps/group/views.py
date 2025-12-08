# apps/group/views.py
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions

from apps.learning.models import Course
from .models import GroupMember, Document
from .serializers import GroupMemberSerializer

class MyGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 현재 로그인한 유저가 해당 코스에서 속한 그룹 찾기
        membership = GroupMember.objects.filter(
            user=request.user,
            group__course=course
        ).select_related("group").first()

        if membership is None:
            return Response({"group": None}, status=status.HTTP_200_OK)

        serializer = GroupMemberSerializer(membership)
        data = {
            "group": {
                "id": membership.group.id,
                "name": membership.group.name,
            }
        }
        return Response(data, status=status.HTTP_200_OK)


from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone

from .models import GroupMessage

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def group_messages(request, group_id):
    user = request.user

    qs = GroupMessage.objects.filter(group_id=group_id).select_related("user").order_by("created_at")

    data = []
    for msg in qs:
        data.append({
            "id": msg.id,
            "sender": msg.user.username,
            "text": msg.content,
            "time": timezone.localtime(msg.created_at).strftime("%H:%M"),
            "is_me": (msg.user_id == user.id),
        })

    return Response(data)



from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions

from .models import Group, GroupFile
from .serializers import GroupFileSerializer
from django.shortcuts import get_object_or_404

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
@method_decorator(csrf_exempt, name="dispatch")     #개발용으로 임시 사용

class GroupFileListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, group_id):
        """그룹의 모든 파일 목록 조회"""
        group = get_object_or_404(Group, id=group_id)
        

        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({"detail": "You are not a member of this group"}, status=403)

        files = group.files.all().order_by("-created_at")
        serializer = GroupFileSerializer(
            files,
            many=True,
            context={"request": request},  # file_url 절대 경로
        )
        return Response(serializer.data)


    def post(self, request, group_id):
        """파일 업로드"""
        group = get_object_or_404(Group, id=group_id)

        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({"detail": "You are not a member of this group"}, status=403)
        
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "file is required"}, status=400)

        group_file = GroupFile.objects.create(
            group=group,
            uploader=request.user,
            file=uploaded_file,
        )

        serializer = GroupFileSerializer(
            group_file,
            context={"request": request},
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# 그룹 메시지 
from .models import GroupMessage

class GroupMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        # 해당 그룹의 메시지를 오래된 순으로 반환
        messages = (
            GroupMessage.objects
            .filter(group_id=group_id)
            .select_related("user")
            .order_by("created_at")
        )

        data = [
            {
                "id": m.id,
                "sender": m.user.username,
                "text": m.content,
                "time": m.created_at.strftime("%H:%M"),
            }
            for m in messages
        ]
        return Response(data)

    def post(self, request, group_id):
        content = request.data.get("message") or request.data.get("text")
        if not content or not str(content).strip():
            return Response({"error": "message is required"}, status=status.HTTP_400_BAD_REQUEST)

        msg = GroupMessage.objects.create(
            group_id=group_id,
            user=request.user,
            content=content.strip(),
        )
        data = {
            "id": msg.id,
            "sender": msg.user.username,
            "text": msg.content,
            "time": msg.created_at.strftime("%H:%M"),
        }
        return Response(data, status=status.HTTP_201_CREATED)
    
# notion
from .models import Document
from .models import Group, GroupMember, Document
def get_or_create_root(group):
    root, _ = Document.objects.get_or_create(
        group=group,
        block_type="root",
        parent=None,
    )
    return root


class DocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)

        # 그룹 멤버 체크
        if not GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response({"detail": "권한이 없습니다."}, status=403)

        parent_id = request.query_params.get("parent_id")

        # 1) parent_id 없으면 → 그룹의 루트부터
        if parent_id is None:
            parent = get_or_create_root(group)
        else:
            # 2) parent_id 있으면 → 그걸 부모로 사용하는 노드
            parent = get_object_or_404(Document, id=parent_id, group=group)

        children = parent.children.all().order_by("order_index")

        return Response({
            "parent": {
                "id": parent.id,
                "block_type": parent.block_type,
                "content": parent.content,
                "parent_id": parent.parent_id,  # 상위로 올라갈 때 쓰면 됨
            },
            "children": [
                {
                    "id": c.id,
                    "block_type": c.block_type,
                    "content": c.content,
                    "toggle_inner": c.toggle_inner,
                    "parent_id": c.parent_id,
                    "order_index": c.order_index,
                }
                for c in children
            ],
        })