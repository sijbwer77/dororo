from django.contrib import admin
from .models import MessageRoom, MessageRoomMember, Message


@admin.register(MessageRoom)
class MessageRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    #filter_horizontal = ('members',)


@admin.register(MessageRoomMember)
class MessageRoomMemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'user', 'last_read_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'content', 'created_at')
    search_fields = ('content',)
