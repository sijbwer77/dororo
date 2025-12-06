from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Notice
from .serializers import NoticeSerializer


class NoticeListCreateAPIView(generics.ListCreateAPIView):
    """
    GET /api/notices/  -> 공지 목록
    POST /api/notices/ -> 새 공지 작성 (관리자/매니저 전용으로 가정)
    """

    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            # 학생, 비로그인도 읽게 할 거면 AllowAny
            return [AllowAny()]
        # 작성은 관리자만 (너네 권한 구조에 맞게 커스텀해도 됨)
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # 작성자 정보 저장 (로그인 안 되어 있으면 None)
        user = None
        if self.request.user and self.request.user.is_authenticated:
            user = self.request.user
        serializer.save(author=user)

    # 🔥 디버그용으로 추가
    def create(self, request, *args, **kwargs):
        print("=== DEBUG: Notice create view reached ===")
        print("request.data =", request.data)
        return super().create(request, *args, **kwargs)


class NoticeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/notices/<id>/
    PUT    /api/notices/<id>/
    PATCH  /api/notices/<id>/
    DELETE /api/notices/<id>/
    """

    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def notice_bulk_delete(request):
    """
    POST /api/notices/bulk-delete/
    body: {"ids": [1,2,3]}
    """

    ids = request.data.get("ids", [])
    if not isinstance(ids, list):
        return Response(
            {"detail": "ids 는 배열이어야 합니다."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    qs = Notice.objects.filter(id__in=ids)
    deleted_count = qs.count()
    qs.delete()

    return Response(
        {"deleted": deleted_count},
        status=status.HTTP_200_OK,
    )
