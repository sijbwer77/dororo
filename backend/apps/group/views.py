# apps/group/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

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
    
#Document (notiont 기능)
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
