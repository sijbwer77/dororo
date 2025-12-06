from django.urls import path

from .views import (
    ConsultationCloseAPIView,
    ConsultationDetailAPIView,
    ConsultationListCreateAPIView,
    ConsultationMessageCreateAPIView,
    ConsultationSuggestionAPIView,
)

urlpatterns = [
    # 3-1 목록 / 3-2 생성
    path("consultations/", ConsultationListCreateAPIView.as_view()),

    # 3-3 상세
    path("consultations/<int:consultation_id>/", ConsultationDetailAPIView.as_view()),

    # 3-4 메시지 전송
    path(
        "consultations/<int:consultation_id>/messages/",
        ConsultationMessageCreateAPIView.as_view(),
    ),

    # 3-5 종료
    path(
        "consultations/<int:consultation_id>/close/",
        ConsultationCloseAPIView.as_view(),
    ),

    # 추천 답변 (텍스트 기반)
    path(
        "consultations/<int:consultation_id>/suggestion/",
        ConsultationSuggestionAPIView.as_view(),
    ),
]
