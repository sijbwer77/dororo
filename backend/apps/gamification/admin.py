# apps/gamification/admin.py

from django.contrib import admin

from .models import GamificationProfile, DailyLmsAccess


@admin.register(GamificationProfile)
class GamificationProfileAdmin(admin.ModelAdmin):
    """
    유저 게이미피케이션 요약 (점수/레벨/진행률) 관리용
    """
    list_display = (
        "user",
        "total_score",
        "stage",
        "step",
        "progress_percent",
        "created_at",
        "updated_at",
    )
    list_filter = ("stage", "step", "created_at", "updated_at")
    search_fields = ("user__username", "user__first_name", "user__last_name")
    ordering = ("-total_score",)

    readonly_fields = ("created_at", "updated_at")

    def progress_percent(self, obj):
        if obj.progress is None:
            return "-"
        return f"{obj.progress * 100:.1f}%"

    progress_percent.short_description = "진행률"


@admin.register(DailyLmsAccess)
class DailyLmsAccessAdmin(admin.ModelAdmin):
    """
    일자별 LMS 접속/출석 도장 로그 관리용
    """
    list_display = (
        "user",
        "date",
        "has_accessed",
        "is_checked",
        "created_at",
        "updated_at",
    )
    list_filter = (
        "has_accessed",
        "is_checked",
        "date",
        "created_at",
    )
    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
    )
    ordering = ("-date", "-created_at")

    readonly_fields = ("created_at", "updated_at")

    # 하루에 한 줄만 있어야 하니까, same user/date 중복 있을 때 한눈에 보기 쉬움
