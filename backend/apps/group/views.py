# apps/group/views.py
from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from rest_framework.authentication import SessionAuthentication

from apps.learning.models import Course
from .models import GroupMember, Document
from .serializers import GroupMemberSerializer, DocumentSerializer

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
    
# notiont 기능 - 수정중
from .models import Document, Group

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Disable CSRF check for API endpoints that are called with session cookies
        return

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


@method_decorator(csrf_exempt, name="dispatch")
class PageListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request, group_id):
        folders = (
            Document.objects
            .filter(group_id=group_id, parent__isnull=True, block_type="folder")
            .order_by("order_index", "created_at")
        )
        pages_without_folder = (
            Document.objects
            .filter(group_id=group_id, parent__isnull=True, block_type="page")
            .order_by("order_index", "created_at")
        )

        data = []
        for f in folders:
            children = (
                Document.objects
                .filter(parent=f, block_type="page")
                .order_by("order_index", "created_at")
            )
            data.append({
                "id": f.id,
                "name": f.content or "폴더",
                "order_index": f.order_index,
                "items": [
                    {
                        "id": c.id,
                        "title": c.content or f"Page {c.id}",
                        "order_index": c.order_index,
                    } for c in children
                ]
            })

        # 고아 페이지는 루트 버킷으로 반환
        if pages_without_folder:
            data.append({
                "id": "root",
                "name": "페이지",
                "order_index": 0,
                "items": [
                    {
                        "id": p.id,
                        "title": p.content or f"Page {p.id}",
                        "order_index": p.order_index,
                    } for p in pages_without_folder
                ]
            })

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, group_id):
        title = (request.data.get("title") or request.data.get("content") or "").strip()
        if not title:
            return Response({"error": "title is required"}, status=status.HTTP_400_BAD_REQUEST)

        block_type = request.data.get("block_type", "page")
        parent_id = request.data.get("parent_id")

        if block_type == "folder":
            max_order = (
                Document.objects
                .filter(group_id=group_id, parent__isnull=True, block_type="folder")
                .aggregate(models.Max("order_index"))
                .get("order_index__max") or 0
            )
            folder = Document.objects.create(
                group_id=group_id,
                parent=None,
                block_type="folder",
                content=title,
                order_index=max_order + 1,
            )
            return Response(
                {"id": folder.id, "name": folder.content, "order_index": folder.order_index, "items": []},
                status=status.HTTP_201_CREATED,
            )
        else:
            parent_obj = None
            if parent_id and parent_id != "root":
                parent_obj = Document.objects.filter(id=parent_id, group_id=group_id, block_type="folder").first()
            max_order = (
                Document.objects
                .filter(group_id=group_id, parent=parent_obj, block_type="page")
                .aggregate(models.Max("order_index"))
                .get("order_index__max") or 0
            )
            page = Document.objects.create(
                group_id=group_id,
                parent=parent_obj,
                block_type="page",
                content=title,
                order_index=max_order + 1,
            )
            return Response(
                {
                    "id": page.id,
                    "title": page.content,
                    "order_index": page.order_index,
                    "parent_id": parent_obj.id if parent_obj else None,
                },
                status=status.HTTP_201_CREATED,
            )


@method_decorator(csrf_exempt, name="dispatch")
class DocumentBlockCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request, group_id, page_id):
        try:
            parent = Document.objects.get(id=page_id, group_id=group_id)
        except Document.DoesNotExist:
            return Response({"error": "Page not found"}, status=status.HTTP_404_NOT_FOUND)

        block_type = request.data.get("block_type", "text")
        content = request.data.get("content", "")
        max_order = (
            Document.objects
            .filter(group_id=group_id, parent=parent)
            .aggregate(models.Max("order_index"))
            .get("order_index__max") or 0
        )
        doc = Document.objects.create(
            group_id=group_id,
            parent=parent,
            block_type=block_type,
            content=content,
            order_index=max_order + 1,
        )
        ser = DocumentSerializer(doc)
        return Response(ser.data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name="dispatch")
class DocumentUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def patch(self, request, doc_id):
        try:
            doc = Document.objects.select_for_update().get(id=doc_id)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        data = {}
        if "content" in request.data:
            data["content"] = request.data.get("content", "")
        if "block_type" in request.data:
            data["block_type"] = request.data.get("block_type")
        if "order_index" in request.data:
            data["order_index"] = request.data.get("order_index")
        if "parent" in request.data:
            data["parent_id"] = request.data.get("parent")

        for k, v in data.items():
            setattr(doc, k, v)
        doc.save()

        ser = DocumentSerializer(doc)
        return Response(ser.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name="dispatch")
class PageReorderView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request, group_id):
        """
        Payload 예:
        {
            "parent": null | <folder_id> | <page_id>,
            "orders": [ {"id":1,"order_index":1}, {"id":5,"order_index":2} ]
        }
        """
        parent = request.data.get("parent")
        orders = request.data.get("orders")
        if not isinstance(orders, list):
            return Response({"error": "orders must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        ids = [item.get("id") for item in orders if "id" in item]
        docs = {
            d.id: d
            for d in Document.objects.filter(id__in=ids, group_id=group_id)
        }
        for item in orders:
            doc = docs.get(item.get("id"))
            if doc is None:
                continue
            fields = []
            if "order_index" in item:
                doc.order_index = item["order_index"]
                fields.append("order_index")
            if parent is not None:
                doc.parent_id = parent if parent != "root" else None
                fields.append("parent")
            if fields:
                doc.save(update_fields=fields)

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
