# apps/message/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CourseMessageThread, CourseMessage
from apps.learning.models import Course


class CourseMessageSerializer(serializers.ModelSerializer):
    sender_nickname = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = CourseMessage
        fields = [
            "id",
            "content",
            "created_at",
            "sender_nickname",
            "is_mine",
            "attachment",
        ]
        read_only_fields = ["id", "created_at", "sender_nickname", "is_mine"]

    def get_sender_nickname(self, obj):
        # LocalAccount.nickname 쓰고 싶으면 여기를 수정
        local = getattr(obj.sender, "localaccount", None)
        if local and local.nickname:
            return local.nickname
        return obj.sender.username

    def get_is_mine(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.sender_id == request.user.id


class CourseMessageThreadListSerializer(serializers.ModelSerializer):
    last_message_preview = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = CourseMessageThread
        fields = [
            "id",
            "course",
            "course_title",
            "title",
            "last_message_preview",
            "last_message_at",
            "unread_count",
            "is_closed",
        ]

    def get_last_message_preview(self, obj):
        last = obj.messages.last()
        if not last:
            return ""
        return last.content[:50]

    def get_last_message_at(self, obj):
        last = obj.messages.last()
        if not last:
            return None
        return last.created_at

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return 0
        # 내가 보낸 건 제외하고 is_read=False 인 것만 카운트
        return obj.messages.filter(is_read=False).exclude(
            sender=request.user
        ).count()


class CourseMessageThreadDetailSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)
    messages = CourseMessageSerializer(many=True, read_only=True)

    class Meta:
        model = CourseMessageThread
        fields = [
            "id",
            "course",
            "course_title",
            "title",
            "is_closed",
            "created_at",
            "updated_at",
            "messages",
        ]


class CreateThreadSerializer(serializers.Serializer):
    """
    POST /api/messages/ 에서 사용할 입력용
    """
    course_id = serializers.IntegerField()
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        course = Course.objects.get(pk=validated_data["course_id"])
        thread = CourseMessageThread.objects.create(
            course=course,
            creator=user,
            title=validated_data["title"],
        )
        CourseMessage.objects.create(
            thread=thread,
            sender=user,
            content=validated_data["content"],
        )
        return thread


class ReplyMessageSerializer(serializers.Serializer):
    """
    POST /api/messages/{id}/reply/ 에서 사용할 입력용
    """
    content = serializers.CharField()

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        thread = self.context["thread"]

        message = CourseMessage.objects.create(
            thread=thread,
            sender=user,
            content=validated_data["content"],
        )
        return message
