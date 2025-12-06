from django.contrib import admin
from .models import Group, GroupMember, GroupFile, GroupMessage, Document


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at',)

@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ('group', 'user')
    search_fields = ('group__name', 'user__username')

@admin.register(GroupFile)
class GroupFileAdmin(admin.ModelAdmin):
    list_display = ("id", "group", "uploader", "file", "created_at")
    list_filter = ("group", "uploader")
    search_fields = ("file", "uploader__username")


@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ('group', 'user', 'created_at')
    search_fields = ('group__name', 'user__username', 'content')
    readonly_fields = ('created_at',)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('group', 'block_type', 'order_index', 'created_at',)
    search_fields = ('content', 'group__name')
    list_filter = ('block_type',)
    readonly_fields = ('created_at',)
