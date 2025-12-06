# apps/message/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import CourseMessageThread, CourseMessage
from apps.learning.models import Course


class CourseMessageSerializer(serializers.ModelSerializer):
    """
    개별 메시지(한 줄) 직렬화
    """
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

    def get_sender_nickname(self, obj):
        local = getattr(obj.sender, "localaccount", None)
        if local and getattr(local, "nickname", None):
            return local.nickname
        return obj.sender.username

    def get_is_mine(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.sender_id == request.user.id


class CourseMessageThreadListSerializer(serializers.ModelSerializer):
    """
    스레드 목록용 직렬화 (좌측 리스트)
    """
    course_title = serializers.CharField(source="course.title", read_only=True)
    last_message_at = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

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
            "last_message_at",
            "last_message_preview",
            "unread_count",
        ]

    def get_last_message_at(self, obj):
        last = obj.messages.order_by("-created_at").first()
        return last.created_at if last else None

    def get_last_message_preview(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if not last:
            return ""
        return last.content[:100]

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class CourseMessageThreadDetailSerializer(serializers.ModelSerializer):
    """
    스레드 상세 + 메시지 목록 직렬화
    """
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
    # 🔥 내용은 비워도 되게 (파일만 보내는 경우 대비)
    content = serializers.CharField(allow_blank=True)
    attachment = serializers.FileField(required=False, allow_null=True)

    def validate_course_id(self, value):
        if not Course.objects.filter(pk=value).exists():
            raise serializers.ValidationError("유효하지 않은 강의입니다.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user

        course = Course.objects.get(pk=validated_data["course_id"])
        attachment = validated_data.get("attachment")

        thread = CourseMessageThread.objects.create(
            course=course,
            creator=user,
            title=validated_data["title"],
        )
        CourseMessage.objects.create(
            thread=thread,
            sender=user,
            content=validated_data.get("content", ""),
            attachment=attachment,
        )
        return thread


class ReplyMessageSerializer(serializers.Serializer):
    """
    POST /api/messages/{id}/reply/ 에서 사용할 입력용
    """
    # 🔥 내용은 비워도 되게 (파일만 보내는 경우 대비)
    content = serializers.CharField(allow_blank=True)
    attachment = serializers.FileField(required=False, allow_null=True)

    def create(self, validated_data):
        request = self.context["request"]
        user = request.user
        thread = self.context["thread"]

        attachment = validated_data.get("attachment")

        message = CourseMessage.objects.create(
            thread=thread,
            sender=user,
            content=validated_data.get("content", ""),
            attachment=attachment,
        )
        return message
