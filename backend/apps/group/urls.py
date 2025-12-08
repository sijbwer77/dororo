# apps/group/urls.py
from django.urls import path

from .views import (
    MyGroupView,
    GroupFileListCreateView,
    GroupMessageListView,

    GroupMessageListView,
    group_messages,
    
    DocumentView,
)

urlpatterns = [
    path("<int:course_id>/my-group/", MyGroupView.as_view()),

    path("<int:group_id>/files/", GroupFileListCreateView.as_view()),

    path("<int:group_id>/messages/", GroupMessageListView.as_view()),
    path("<int:group_id>/messages_load/", group_messages),

    path("<int:group_id>/documents/", DocumentView.as_view(), name="group-documents"),
]
