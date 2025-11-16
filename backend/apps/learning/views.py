# apps/learning/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from .models import Course
from .serializers import CourseSerializer

class IsInstructorOrAdminOrReadOnly(permissions.BasePermission):
    """
    읽기: 모두 허용
    쓰기: 담당 강사 또는 관리자만
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff or obj.instructor_id == getattr(request.user, "id", None)

class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer

    # MVP에서 AllowAny였던 부분을 안전하게 개선
    permission_classes = [IsInstructorOrAdminOrReadOnly]

    # 검색/정렬 지원 (모델/스키마 변경 없음)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "instructor__username", "instructor__email"]
    ordering_fields = ["created_at", "capacity", "title"]
    ordering = ["-created_at"]
    pagination_class = StandardPagination

    def perform_create(self, serializer):
        """
        작성자가 instructor를 명시하면 그대로 사용하고,
        생략 시 로그인 사용자를 기본 강사로 설정.
        (필드/스키마 변경 없음)
        """
        instructor = serializer.validated_data.get("instructor") or getattr(self.request, "user", None)
        serializer.save(instructor=instructor)
