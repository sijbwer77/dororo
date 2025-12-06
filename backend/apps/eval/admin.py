from django.contrib import admin
from .models import EvaluationQuestion, CourseEvaluation, EvaluationAnswer


@admin.register(EvaluationQuestion)
class EvaluationQuestionAdmin(admin.ModelAdmin):
    list_display = ("order", "text", "is_text", "is_active")
    # 첫 번째 필드(order)는 클릭 링크로 쓰지 말고,
    # text를 링크로 쓰겠다고 명시
    list_display_links = ("text",)
    # 이제 order를 포함해서 수정 가능
    list_editable = ("order", "is_text", "is_active")
    search_fields = ("text",)
    list_filter = ("is_active", "is_text")
    ordering = ("order", "id")


@admin.register(CourseEvaluation)
class CourseEvaluationAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "student", "submitted_at")
    search_fields = ("course__title", "student__username")
    list_filter = ("course",)
    readonly_fields = ("submitted_at", "updated_at")


@admin.register(EvaluationAnswer)
class EvaluationAnswerAdmin(admin.ModelAdmin):
    list_display = ("evaluation", "question", "score", "short_text")
    search_fields = (
        "question__text",
        "evaluation__course__title",
        "evaluation__student__username",
    )

    def short_text(self, obj):
        if not obj.text:
            return ""
        return (obj.text[:30] + "…") if len(obj.text) > 30 else obj.text
