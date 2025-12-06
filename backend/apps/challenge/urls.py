# challenge/urls.py
from django.urls import path
from .views import ChallengeView

urlpatterns = [
    path("student/challenge/", ChallengeView.as_view(), name="student-challenge"),
]
