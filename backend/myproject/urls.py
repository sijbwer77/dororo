from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from .views import serve_course_message_file




router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),

    path("api/notices/", include("apps.notice.urls")),

    path("api/", include("apps.users.urls")),
    path("api/", include("apps.learning.urls")),
    path("api/group/",include("apps.group.urls")),
    path('api/learning/',include('apps.learning.urls')),
    path("api/", include("apps.gamification.urls")),
    path("api/", include("apps.consultation.urls")),
    path("api/", include("apps.challenge.urls")),
    path("api/", include("apps.message.urls")),
    path("api/", include("apps.eval.urls")),
    path("api/", include("apps.schedule.urls")), 
    re_path(r"^course_messages/(?P<path>.*)$", serve_course_message_file),

    
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    # 👇 이 한 줄이 "course_messages 폴더 전체를 /course_messages/ 밑으로 서빙해줘" 라는 뜻이야
    urlpatterns += static(
        "/course_messages/",
        document_root=settings.BASE_DIR / "course_messages",
    )

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)