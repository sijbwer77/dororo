# apps/eval/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import EvaluationQuestion
from .serializers import (
    EvaluationQuestionSerializer,
    CourseEvaluationCreateSerializer,
    CourseEvaluationSimpleSerializer,
)


class EvaluationQuestionListAPIView(generics.ListAPIView):
    """
    GET /api/evals/questions/
    강의평가 문항 리스트
    """
    queryset = EvaluationQuestion.objects.filter(is_active=True).order_by("order", "id")
    serializer_class = EvaluationQuestionSerializer
    permission_classes = [AllowAny]  # 필요하면 IsAuthenticated로 바꿔도 됨


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_evaluation(request):
    """
    POST /api/evals/responses/
    {
      "course_id": 1,
      "answers": [
        {"question": 1, "score": 5},
        {"question": 2, "score": 4},
        {"question": 3, "text": "자유 의견..."}
      ]
    }
    """
    serializer = CourseEvaluationCreateSerializer(
        data=request.data,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    evaluation = serializer.save()
    out = CourseEvaluationSimpleSerializer(evaluation)
    return Response(out.data, status=status.HTTP_201_CREATED)
