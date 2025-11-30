from django.contrib import admin
from .models import MessageRoom, MessageRoomMember, Message


@admin.register(MessageRoom)
class MessageRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'course', 'name', 'created_at', 'updated_at')
    list_filter = ('course',)   # 강의별로 필터하기 좋게


@admin.register(MessageRoomMember)
class MessageRoomMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'user', 'last_read_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'content', 'created_at')
    search_fields = ('content',)
