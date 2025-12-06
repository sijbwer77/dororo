# apps/users/admin.py
from django.contrib import admin
from .models import LocalAccount, SocialAccount


@admin.register(LocalAccount)
class LocalAccountAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "nickname",
        "phone_number",
        "role",
        "solvedac_handel",
        "account_type",
        "profile_image_preview",
        "created_at",
        "updated_at",
    )

    list_filter = ("role", "account_type", "created_at")
    search_fields = ("user__username", "nickname", "phone_number", "solvedac_handel")

    readonly_fields = ("created_at", "updated_at", "profile_image_preview")

    # 관리자 상세페이지에서 이미지 미리보기 제공
    def profile_image_preview(self, obj):
        if obj.profile_image:
            return f"<img src='/{obj.profile_image}' width='60' height='60' style='border-radius:50%'/>"
        return "(No Image)"

    profile_image_preview.allow_tags = True
    profile_image_preview.short_description = "Profile Image"


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "social_id", "created_at")
    search_fields = ("user__username", "provider", "social_id")
