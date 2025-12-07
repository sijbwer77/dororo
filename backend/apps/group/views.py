# apps/group/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions

from .models import Course, GroupMember
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
        return Response(serializer.data, status=status.HTTP_200_OK)


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


from .models import Group, GroupFile
from .serializers import GroupFileSerializer
from django.shortcuts import get_object_or_404

class GroupFileListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id):
        """그룹의 모든 파일 목록 조회"""
        group = get_object_or_404(Group, id=group_id)

        files = group.files.all()
        serializer = GroupFileSerializer(files, many=True)
        return Response(serializer.data)

    def post(self, request, group_id):
        """파일 업로드"""
        group = get_object_or_404(Group, id=group_id)

        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "file is required"}, status=400)

        group_file = GroupFile.objects.create(
            group=group,
            uploader=request.user,
            file=uploaded_file,
        )

        serializer = GroupFileSerializer(group_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


#아래는 미구현됨 아직 테스트중

# 그룹 메시지 - 수정중
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
    
# notiont 기능 - 수정중
from .models import Document, Group

def build_document_tree(document):
    return {
        "id": document.id,
        "block_type": document.block_type,
        "content": document.content,
        "file": document.file.url if document.file else None,
        "order_index": document.order_index,
        "children": [
            build_document_tree(child)
            for child in document.children.all().order_by("order_index")
        ]
    }
class PageDetailView(APIView):

    def get(self, request, group_id, page_id):

        # 1. 그룹 검증
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

        # 2. 페이지 문서 찾기
        try:
            page = Document.objects.get(id=page_id, group=group, block_type="page")
        except Document.DoesNotExist:
            return Response({"error": "Page not found"}, status=status.HTTP_404_NOT_FOUND)

        # 3. 트리 구조로 변환
        data = build_document_tree(page)

        return Response(data, status=status.HTTP_200_OK)
