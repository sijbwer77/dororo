from django.contrib import admin
from .models import CourseMessageThread, CourseMessage


class CourseMessageInline(admin.TabularInline):
    model = CourseMessage
    extra = 0
    fields = ("sender", "content", "attachment", "is_read", "created_at")
    readonly_fields = ("created_at",)
    ordering = ("created_at",)


@admin.register(CourseMessageThread)
class CourseMessageThreadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "course",
        "creator",
        "is_closed",
        "updated_at",
        "created_at",
    )
    list_filter = ("is_closed", "course")
    search_fields = ("title", "creator__username", "course__name")
    ordering = ("-updated_at",)
    inlines = [CourseMessageInline]


@admin.register(CourseMessage)
class CourseMessageAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "thread",
        "sender",
        "short_content",
        "is_read",
        "created_at",
    )
    list_filter = ("is_read", "sender")
    search_fields = ("sender__username", "content")
    ordering = ("created_at",)

    def short_content(self, obj):
        return obj.content[:30]
    short_content.short_description = "내용 미리보기"
