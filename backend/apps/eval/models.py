# apps/eval/models.py
from django.conf import settings
from django.db import models

from apps.learning.models import Course  # 네가 보여준 Course 모델


class EvaluationQuestion(models.Model):
    """
    강의평가 문항
    """
    text = models.CharField("질문 내용", max_length=255)
    is_text = models.BooleanField(
        "서술형 문항 여부",
        default=False,
        help_text="True면 서술형(text)으로만 답변, False면 점수형(score) 중심"
    )
    order = models.PositiveSmallIntegerField("표시 순서", default=1)
    is_active = models.BooleanField("사용 여부", default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"[{self.order}] {self.text}"


class CourseEvaluation(models.Model):
    """
    한 학생이 한 강의에 대해 제출한 '한 번의' 평가
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # = auth.User (지금 구조에선)
        on_delete=models.CASCADE,
        related_name="course_evaluations",
        verbose_name="학생"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="evaluations",
        verbose_name="강의"
    )
    submitted_at = models.DateTimeField("제출 시각", auto_now_add=True)
    updated_at = models.DateTimeField("수정 시각", auto_now=True)

    class Meta:
        unique_together = ("student", "course")
        verbose_name = "강의 평가"
        verbose_name_plural = "강의 평가들"

    def __str__(self):
        return f"{self.student} - {self.course} 평가"


class EvaluationAnswer(models.Model):
    """
    한 평가(CourseEvaluation)에 대한 개별 문항 답변
    """
    evaluation = models.ForeignKey(
        CourseEvaluation,
        on_delete=models.CASCADE,
        related_name="answers",
        verbose_name="평가"
    )
    question = models.ForeignKey(
        EvaluationQuestion,
        on_delete=models.CASCADE,
        related_name="answers",
        verbose_name="질문"
    )
    score = models.PositiveSmallIntegerField("점수", null=True, blank=True)
    text = models.TextField("서술형 답변", blank=True)

    class Meta:
        unique_together = ("evaluation", "question")

    def __str__(self):
        return f"{self.evaluation} / {self.question}"

    @property
    def is_text_answer(self):
        return self.question.is_text
