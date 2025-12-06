# apps/group/urls.py
from django.urls import path
from . import views

from .views import PageDetailView


urlpatterns = [
    # GET /api/group/<group_id>/messages/
    path("<int:group_id>/messages/", views.GroupMessageListView.as_view()),
    path("groups/<int:group_id>/pages/<int:page_id>/", PageDetailView.as_view()),
]