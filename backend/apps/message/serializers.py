# apps/message/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.learning.models import Course
from .models import CourseMessage, CourseMessageRecipient

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):
    nickname = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "nickname", "role")

    def get_nickname(self, obj):
        local = getattr(obj, "local_account", None)
        return getattr(local, "nickname", None)

    def get_role(self, obj):
        local = getattr(obj, "local_account", None)
        return getattr(local, "role", None)


class SimpleCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ("id", "title")


class MessageListSerializer(serializers.ModelSerializer):
    """
    왼쪽 '전체 메시지함' 리스트용 (제목, 첫 줄, 날짜, 읽음여부)
    """
    course = SimpleCourseSerializer(read_only=True)
    sender = SimpleUserSerializer(read_only=True)
    is_read = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    class Meta:
        model = CourseMessage
        fields = (
            "id",
            "course",
            "sender",
            "subject",
            "preview",
            "sent_at",
            "is_read",
        )

    def get_is_read(self, obj):
        """
        현재 로그인 유저 기준 읽음 여부
        """
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return True

        try:
            link = obj.recipient_links.get(recipient=request.user)
            return link.is_read
        except CourseMessageRecipient.DoesNotExist:
            # 내가 보낸 메일(발신함)일 수도 있으니까 일단 읽은 걸로 취급
            return True

    def get_preview(self, obj):
        return obj.body[:50]  # 첫 줄 / 앞부분만 잘라서 리스트에 표시


class MessageDetailSerializer(serializers.ModelSerializer):
    """
    오른쪽 상세 보기용
    """
    course = SimpleCourseSerializer(read_only=True)
    sender = SimpleUserSerializer(read_only=True)
    recipients = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = CourseMessage
        fields = (
            "id",
            "course",
            "sender",
            "recipients",
            "subject",
            "body",
            "sent_at",
            "is_read",
        )

    def get_recipients(self, obj):
        links = obj.recipient_links.select_related("recipient")
        users = [link.recipient for link in links]
        return SimpleUserSerializer(users, many=True).data

    def get_is_read(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return True

        try:
            link = obj.recipient_links.get(recipient=request.user)
            return link.is_read
        except CourseMessageRecipient.DoesNotExist:
            return True


class MessageCreateSerializer(serializers.Serializer):
    """
    메일 보내기용 (프론트에서 POST 할 때 쓸 것)
    """
    course_id = serializers.IntegerField()
    subject = serializers.CharField(max_length=200)
    body = serializers.CharField()
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

    def validate_course_id(self, value):
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError("존재하지 않는 강의입니다.")
        return value

    def validate_recipient_ids(self, value):
        if not value:
            raise serializers.ValidationError("최소 1명 이상에게 보내야 합니다.")
        return value

    def create(self, validated_data):
        request = self.context["request"]
        sender = request.user

        course = Course.objects.get(id=validated_data["course_id"])
        subject = validated_data["subject"]
        body = validated_data["body"]
        recipient_ids = validated_data["recipient_ids"]

        message = CourseMessage.objects.create(
            course=course,
            sender=sender,
            subject=subject,
            body=body,
        )

        users = User.objects.filter(id__in=recipient_ids).distinct()
        for u in users:
            CourseMessageRecipient.objects.create(
                message=message,
                recipient=u,
            )

        return message
