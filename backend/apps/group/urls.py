# apps/group/urls.py
from django.urls import path

from .views import (
    MyGroupView,
    PageDetailView,
    GroupFileListCreateView,
    GroupMessageListView,
    PageListCreateView,
    DocumentBlockCreateView,
    DocumentUpdateView,
    PageReorderView,
)

urlpatterns = [
    path("<int:course_id>/my-group/", MyGroupView.as_view()),
    path("<int:group_id>/files/", GroupFileListCreateView.as_view()),
    path("<int:group_id>/messages/", GroupMessageListView.as_view()),
    path("<int:group_id>/pages/", PageListCreateView.as_view()),
    path("<int:group_id>/pages/reorder/", PageReorderView.as_view()),
    path("<int:group_id>/pages/<int:page_id>/blocks/", DocumentBlockCreateView.as_view()),
    path("pages/<int:doc_id>/", DocumentUpdateView.as_view()),

    #아래는 수정중
    # GET /api/group/<group_id>/messages/
    path("groups/<int:group_id>/pages/<int:page_id>/", PageDetailView.as_view()),
]
