# apps/eval/urls.py
from django.urls import path

from .views import (
    EvaluationQuestionListAPIView,
    submit_evaluation,
    TeacherEvalSummaryAPIView,
    TeacherEvalCourseDetailAPIView,
)

urlpatterns = [
    path("evals/questions/", EvaluationQuestionListAPIView.as_view(),
         name="eval-question-list"),
    path("evals/responses/", submit_evaluation, name="eval-submit"),

    # ⬇️ 강사용/관리자용 통계
    path("evals/teacher/summary/", TeacherEvalSummaryAPIView.as_view(),
         name="eval-teacher-summary"),
    path(
        "evals/teacher/courses/<int:course_id>/",
        TeacherEvalCourseDetailAPIView.as_view(),
        name="eval-teacher-course-detail",
    ),
]
