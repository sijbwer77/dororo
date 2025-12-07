# apps/group/urls.py
from django.urls import path

from .views import MyGroupView
from .views import PageDetailView
from .views import GroupFileListCreateView
from .views import GroupMessageListView

urlpatterns = [
    path("<int:course_id>/my-group/", MyGroupView.as_view()),
    path("<int:group_id>/files/", GroupFileListCreateView.as_view()),

    path("<int:group_id>/messages/", GroupMessageListView.as_view()),


    path("groups/<int:group_id>/pages/<int:page_id>/", PageDetailView.as_view()),
]
