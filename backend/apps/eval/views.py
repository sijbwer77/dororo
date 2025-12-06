# apps/eval/views.py

from django.db.models import Avg, Max, Min, Count, Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.learning.models import Course
from .models import EvaluationQuestion, CourseEvaluation, EvaluationAnswer
from .serializers import (
    EvaluationQuestionSerializer,
    CourseEvaluationCreateSerializer,
    CourseEvaluationSimpleSerializer,
    TeacherSummarySerializer,
    TeacherCourseDetailSerializer,
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

class TeacherEvalSummaryAPIView(generics.GenericAPIView):
    """
    GET /api/evals/teacher/summary/
    - 현재 로그인한 강사가 맡은 강의들의 평가 요약
    - 관리자(is_staff=True)는 전체 강의 볼 수 있게 함
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherSummarySerializer

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.is_staff:
            courses_qs = Course.objects.all()
        else:
            courses_qs = Course.objects.filter(instructor=user)

        courses_qs = courses_qs.order_by("id")
        total_courses = courses_qs.count()

        summary_courses = []
        all_scores_qs = EvaluationAnswer.objects.none()

        for course in courses_qs:
            numeric_answers = EvaluationAnswer.objects.filter(
                evaluation__course=course,
                score__isnull=False,
            )
            all_scores_qs = all_scores_qs | numeric_answers

            stats = numeric_answers.aggregate(
                avg=Avg("score"),
                max=Max("score"),
                min=Min("score"),
                count=Count("id"),
            )

            eval_count = CourseEvaluation.objects.filter(course=course).count()

            instructor = course.instructor
            teacher_name = (
                (instructor.get_full_name() or instructor.username)
                if instructor
                else ""
            )

            summary_courses.append({
                "id": course.id,
                "name": course.title,
                "short_name": course.title[:8],
                "code": course.course_type or "",
                "teacher": teacher_name,
                "avg": float(stats["avg"] or 0.0),
                "max": float(stats["max"] or 0.0),
                "min": float(stats["min"] or 0.0),
                "count": int(eval_count),
            })

        # 전체 평균
        overall_stats = all_scores_qs.aggregate(avg=Avg("score"))
        average_score = overall_stats["avg"]

        # 평가가 하나라도 있는 강의 비율
        courses_with_responses = sum(1 for c in summary_courses if c["count"] > 0)
        completed_ratio = (
            courses_with_responses / total_courses if total_courses > 0 else None
        )

        # 평균 점수 기준 상위 5개만 정렬해서 보내고 싶으면 여기서 정렬
        summary_courses.sort(key=lambda c: c["avg"], reverse=True)
        summary_courses = summary_courses[:5]

        payload = {
            "total_courses": total_courses,
            "completed_ratio": completed_ratio,
            "average_score": average_score,
            "courses": summary_courses,
        }

        serializer = self.get_serializer(payload)
        return Response(serializer.data)


class TeacherEvalCourseDetailAPIView(generics.GenericAPIView):
    """
    GET /api/evals/teacher/courses/<course_id>/
    - 해당 강의에 대한 질문별 평균 점수 + 학생 코멘트
    - 강사 본인 강의 or 관리자만 접근 가능
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherCourseDetailSerializer

    def get(self, request, course_id, *args, **kwargs):
        user = request.user

        if user.is_staff:
            course = get_object_or_404(Course, id=course_id)
        else:
            course = get_object_or_404(Course, id=course_id, instructor=user)

        # 점수형 문항에 대해 질문별 평균
        questions = EvaluationQuestion.objects.filter(is_active=True).order_by("order", "id")

        surveys = []
        for q in questions:
            # 서술형 문항은 점수 평균이 없으니 여기선 건너뜀
            if q.is_text:
                continue

            q_stats = EvaluationAnswer.objects.filter(
                evaluation__course=course,
                question=q,
                score__isnull=False,
            ).aggregate(avg=Avg("score"))

            if q_stats["avg"] is not None:
                surveys.append({
                    "id": q.id,
                    "text": q.text,
                    "avg_score": float(q_stats["avg"]),
                })

        # 학생 코멘트: 서술형 문항의 텍스트 답변
        comments_qs = EvaluationAnswer.objects.filter(
            evaluation__course=course,
            question__is_text=True,
        ).exclude(
            Q(text__isnull=True) | Q(text__exact="")
        )

        comments = list(comments_qs.values_list("text", flat=True))

        instructor = course.instructor
        teacher_name = (
            (instructor.get_full_name() or instructor.username)
            if instructor
            else ""
        )
        info_str = f"{course.course_type or ''} | 강사명 {teacher_name}"

        payload = {
            "id": course.id,
            "name": course.title,
            "info": info_str,
            "surveys": [
                {"id": s["id"], "text": s["text"], "avg_score": s["avg_score"]}
                for s in surveys
            ],
            "comments": comments,
        }

        serializer = self.get_serializer(payload)
        return Response(serializer.data)