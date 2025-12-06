# apps/message/urls.py
from django.urls import path
from .views import (
    CourseMessageThreadListAPIView,
    MessageThreadCreateAPIView,
    MessageThreadDetailAPIView,
    MessageThreadReplyAPIView,
)

urlpatterns = [
    # 코스별 메시지 목록
    path("courses/<int:course_id>/messages/", CourseMessageThreadListAPIView.as_view()),
    # 새 메시지 스레드 생성
    path("messages/", MessageThreadCreateAPIView.as_view()),
    # 스레드 상세
    path("messages/<int:pk>/", MessageThreadDetailAPIView.as_view()),
    # 스레드에 답장
    path("messages/<int:pk>/reply/", MessageThreadReplyAPIView.as_view()),
]
