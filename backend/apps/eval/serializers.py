# apps/eval/serializers.py
from django.db import transaction
from rest_framework import serializers

from apps.learning.models import Course, StudentEnrollment
from .models import EvaluationQuestion, CourseEvaluation, EvaluationAnswer


class EvaluationQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationQuestion
        fields = ["id", "text", "is_text", "order"]
        read_only_fields = fields


class EvaluationAnswerInputSerializer(serializers.Serializer):
    """
    answers 배열의 원소 형태
    {
      "question": 1,
      "score": 5,
      "text": "."
    }
    """
    question = serializers.IntegerField()
    score = serializers.IntegerField(required=False, min_value=1, max_value=5)
    text = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        score = attrs.get("score")
        text = attrs.get("text")

        # score, text 둘 다 비어 있으면 에러
        if score is None and (text is None or text == ""):
            raise serializers.ValidationError(
                "score 또는 text 중 하나는 반드시 있어야 합니다."
            )
        return attrs


class CourseEvaluationCreateSerializer(serializers.Serializer):
    """
    POST /api/evals/responses/ 요청 바디
    {
      "course_id": 1,
      "answers": [
        {"question": 1, "score": 5},
        {"question": 2, "score": 4},
        {"question": 3, "text": "자유 의견..."}
      ]
    }
    """
    course_id = serializers.IntegerField()
    answers = EvaluationAnswerInputSerializer(many=True)

    # ----------- 개별 필드 검증 -----------

    def validate_course_id(self, value):
        # 유효한 강의인지 체크 + self.course 저장
        try:
            course = Course.objects.get(id=value)
        except Course.DoesNotExist:
            raise serializers.ValidationError("존재하지 않는 강의입니다.")
        self.course = course
        return value

    # ----------- 전체 검증 -----------

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        course = getattr(self, "course", None)

        if not user or not user.is_authenticated:
            raise serializers.ValidationError("로그인이 필요합니다.")

        if course is None:
            raise serializers.ValidationError("유효하지 않은 강의입니다.")

        # 1) 이미 평가했는지 체크 (있으면 기억만 하고 에러는 안 냄)
        existing = CourseEvaluation.objects.filter(
            student=user,
            course=course,
        ).first()
        # create()에서 쓰려고 저장
        self.existing_evaluation = existing

        # 2) 수강 중인지 체크
        if not StudentEnrollment.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError("이 강의를 수강 중인 학생만 평가할 수 있습니다.")

        # 3) 질문 유효성 체크
        question_ids = {a["question"] for a in attrs["answers"]}
        existing_questions = EvaluationQuestion.objects.filter(
            id__in=question_ids,
            is_active=True,
        ).values_list("id", flat=True)
        missing = question_ids - set(existing_questions)
        if missing:
            raise serializers.ValidationError(
                f"존재하지 않거나 비활성화된 질문 ID가 포함되어 있습니다: {list(missing)}"
            )

        return attrs

    # ----------- 생성/수정 로직 -----------

    @transaction.atomic
    def create(self, validated_data):
        """
        - 처음 제출: 새 CourseEvaluation + Answer 생성
        - 같은 학생/같은 강의 두 번째 이후 제출:
          기존 CourseEvaluation 재사용하고, Answer 싹 지우고 새로 채움(수정처럼 동작)
        """
        request = self.context["request"]
        user = request.user
        course = self.course

        # 1) 기존 평가가 있으면 재사용, 없으면 새로 생성
        evaluation = getattr(self, "existing_evaluation", None)
        if evaluation is None:
            evaluation = CourseEvaluation.objects.create(
                student=user,
                course=course,
            )
        else:
            # 기존 답변 전부 삭제 (질문 수/내용 바뀌어도 안전하게 갈아끼우기)
            evaluation.answers.all().delete()

        # 2) 새 답변들 생성
        answers_data = validated_data["answers"]
        question_map = {
            q.id: q
            for q in EvaluationQuestion.objects.filter(
                id__in=[a["question"] for a in answers_data]
            )
        }

        answer_objs = []
        for item in answers_data:
            question = question_map[item["question"]]
            score = item.get("score")
            text = item.get("text", "")

            if question.is_text:
                # 서술형이면 score는 무시
                score = None
            else:
                # 점수형이면 text는 없어도 됨
                text = text or ""

            answer_objs.append(
                EvaluationAnswer(
                    evaluation=evaluation,
                    question=question,
                    score=score,
                    text=text,
                )
            )

        EvaluationAnswer.objects.bulk_create(answer_objs)
        return evaluation


class CourseEvaluationSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseEvaluation
        fields = ["id", "course", "submitted_at"]
        read_only_fields = fields


class TeacherCourseSummarySerializer(serializers.Serializer):
    """강사 대시보드 요약용: 강의 하나의 통계"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    short_name = serializers.CharField()
    code = serializers.CharField(allow_blank=True)
    teacher = serializers.CharField()
    avg = serializers.FloatField()
    max = serializers.FloatField()
    min = serializers.FloatField()
    count = serializers.IntegerField()


class TeacherSummarySerializer(serializers.Serializer):
    """강사 전체 요약 + 강의 리스트"""
    total_courses = serializers.IntegerField()
    completed_ratio = serializers.FloatField(allow_null=True)
    average_score = serializers.FloatField(allow_null=True)
    courses = TeacherCourseSummarySerializer(many=True)


class QuestionStatSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    text = serializers.CharField()
    avg_score = serializers.FloatField()


class TeacherCourseDetailSerializer(serializers.Serializer):
    """강의별 상세: 질문별 평균 + 코멘트"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    info = serializers.CharField()
    surveys = QuestionStatSerializer(many=True)
    comments = serializers.ListField(child=serializers.CharField())
