# apps/eval/urls.py
from django.urls import path

from .views import EvaluationQuestionListAPIView, submit_evaluation

urlpatterns = [
    path("evals/questions/", EvaluationQuestionListAPIView.as_view(),
         name="eval-question-list"),
    path("evals/responses/", submit_evaluation, name="eval-submit"),
]
