# apps/eval/views.py

from django.db.models import Avg, Max, Min, Count, Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from apps.learning.models import Course, StudentEnrollment
from rest_framework.views import APIView
from .models import EvaluationQuestion, CourseEvaluation, EvaluationAnswer
from .serializers import (
    EvaluationQuestionSerializer,
    CourseEvaluationCreateSerializer,
    CourseEvaluationSimpleSerializer,
    TeacherSummarySerializer,
    TeacherCourseDetailSerializer,
)


# ===============================
# 공용: 학생용 기본 API
# ===============================
class EvaluationQuestionListAPIView(generics.ListAPIView):
    """
    GET /api/evals/questions/
    강의평가 문항 리스트
    """
    queryset = EvaluationQuestion.objects.filter(is_active=True).order_by("order", "id")
    serializer_class = EvaluationQuestionSerializer
    permission_classes = [IsAuthenticated]


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


# ===============================
# 강사용: 요약 + 상세
# ===============================
class TeacherEvalSummaryAPIView(generics.GenericAPIView):
    """
    GET /api/evals/teacher/summary/
    - 현재 로그인한 강사가 맡은 강의들의 평가 요약
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherSummarySerializer

    def get(self, request, *args, **kwargs):
        user = request.user
        courses_qs = Course.objects.filter(instructor=user).order_by("id")

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
                else "-"
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

        overall_stats = all_scores_qs.aggregate(avg=Avg("score"))
        average_score = overall_stats["avg"]

        courses_with_responses = sum(1 for c in summary_courses if c["count"] > 0)
        completed_ratio = (
            courses_with_responses / total_courses if total_courses > 0 else None
        )

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
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TeacherCourseDetailSerializer

    def get(self, request, course_id, *args, **kwargs):
        user = request.user
        course = get_object_or_404(Course, id=course_id, instructor=user)

        questions = EvaluationQuestion.objects.filter(is_active=True).order_by("order", "id")

        surveys = []
        for q in questions:
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

        comments_qs = EvaluationAnswer.objects.filter(
            evaluation__course=course,
            question__is_text=True,
        ).exclude(Q(text__isnull=True) | Q(text__exact=""))

        comments = list(comments_qs.values_list("text", flat=True))

        instructor = course.instructor
        teacher_name = (
            (instructor.get_full_name() or instructor.username)
            if instructor
            else "-"
        )
        info_str = f"{course.course_type or ''} | 강사명 {teacher_name}"

        payload = {
            "id": course.id,
            "name": course.title,
            "info": info_str,
            "surveys": surveys,
            "comments": comments,
        }

        serializer = self.get_serializer(payload)
        return Response(serializer.data)


# ===============================
# 강사용: 테스트용 강의 매달기 기능
# ===============================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_test_course_list(request):
    """
    GET /api/evals/teacher/test/courses/
    - 테스트용: 전체 강의 목록 + 현재 강사 정보 + 내가 맡은 강의 여부
    """
    courses = Course.objects.all().order_by("id")
    data = []
    for c in courses:
        instructor = c.instructor
        data.append({
            "id": c.id,
            "title": c.title,
            "course_type": c.course_type or "",
            "status": c.status,
            "instructor": (
                (instructor.get_full_name() or instructor.username)
                if instructor
                else None
            ),
            "is_mine": bool(instructor and instructor == request.user),
        })
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def teacher_test_assign_course(request):
    """
    POST /api/evals/teacher/test/courses/assign/
    { "course_id": 1 }
    - 테스트용: 해당 강의의 instructor를 현재 로그인한 유저로 설정
    """
    course_id = request.data.get("course_id")
    if not course_id:
        return Response({"detail": "course_id가 필요합니다."}, status=400)
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({"detail": "존재하지 않는 강의입니다."}, status=404)

    course.instructor = request.user
    course.save(update_fields=["instructor"])

    instructor = course.instructor
    return Response({
        "id": course.id,
        "title": course.title,
        "course_type": course.course_type or "",
        "status": course.status,
        "instructor": (instructor.get_full_name() or instructor.username),
        "is_mine": True,
    })

