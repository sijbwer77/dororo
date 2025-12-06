# apps/group/urls.py
from django.urls import path

from .views import MyGroupView
from .views import PageDetailView


urlpatterns = [
    path("courses/<int:course_id>/my-group/", MyGroupView.as_view()),

    #아래는 수정중
    # GET /api/group/<group_id>/messages/
    path("groups/<int:group_id>/pages/<int:page_id>/", PageDetailView.as_view()),
]
