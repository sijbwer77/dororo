"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from .views import serve_course_message_file




router = DefaultRouter()

urlpatterns = [
    path("api/", include("apps.learning.urls")),
    path("api/group/",include("apps.group.urls")),
    
    path("api/", include("apps.users.urls")),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/learning/',include('apps.learning.urls')),
    path("api/", include("apps.gamification.urls")),
    path("api/", include("apps.consultation.urls")),
    path("api/", include("apps.challenge.urls")),
    path("api/", include("apps.message.urls")),
    path("api/", include("apps.eval.urls")),
    path("api/", include("apps.schedule.urls")), 
    re_path(r"^course_messages/(?P<path>.*)$", serve_course_message_file),
]

if settings.DEBUG:
    # 👇 이 한 줄이 "course_messages 폴더 전체를 /course_messages/ 밑으로 서빙해줘" 라는 뜻이야
    urlpatterns += static(
        "/course_messages/",
        document_root=settings.BASE_DIR / "course_messages",
    )