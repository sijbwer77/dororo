# apps/group/urls.py
from django.urls import path

from .views import (
    MyGroupView,
    GroupFileListCreateView,
    GroupMessageListView,

    GroupMessageListView,
    group_messages,
    
    DocumentListCreateView,
    DocumentDetailView,
)

urlpatterns = [
    path("<int:course_id>/my-group/", MyGroupView.as_view()),

    path("<int:group_id>/files/", GroupFileListCreateView.as_view()),

    path("<int:group_id>/messages/", GroupMessageListView.as_view()),
    path("<int:group_id>/messages_load/", group_messages),

    path("<int:group_id>/documents/", DocumentListCreateView.as_view(), name="group-documents"),
    path("documents/<int:doc_id>/", DocumentDetailView.as_view(), name="document-detail"),
]
