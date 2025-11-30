# apps/message/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.learning.models import Course, StudentEnrollment  # 강의 / 수강정보
from .models import MessageRoom, Message, MessageRoomMember

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):
    """
    유저 기본 정보 (닉네임, 역할까지)
    """
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


class MessageSerializer(serializers.ModelSerializer):
    """
    오른쪽 대화창에 뿌릴 메시지 한 줄
    """
    sender = SimpleUserSerializer(read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "room",
            "sender",
            "content",
            "created_at",
            "updated_at",
            "is_mine",
        )
        read_only_fields = ("id", "sender", "created_at", "updated_at", "is_mine")

    def get_is_mine(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return obj.sender_id == request.user.id


class MessageCreateSerializer(serializers.ModelSerializer):
    """
    기존 스레드에 답장 보낼 때
    """
    class Meta:
        model = Message
        fields = ("room", "content")


class MessageRoomListSerializer(serializers.ModelSerializer):
    """
    왼쪽 메시지함 리스트용 (스레드 한 줄)
    """
    course = SimpleCourseSerializer(read_only=True)
    last_message_preview = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = MessageRoom
        fields = (
            "id",
            "course",
            "name",
            "created_at",
            "updated_at",
            "last_message_preview",
            "last_message_at",
            "unread_count",
        )

    def get_last_message_preview(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        if not last_msg:
            return ""
        return last_msg.content[:50]

    def get_last_message_at(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        return last_msg.created_at if last_msg else None

    def get_unread_count(self, obj):
        """
        현재 로그인 유저 기준 안 읽은 메시지 개수
        """
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return 0

        try:
            membership = obj.room_members.get(user=request.user)
        except MessageRoomMember.DoesNotExist:
            return 0

        last_read = membership.last_read_at
        qs = obj.messages.all()
        if last_read:
            qs = qs.filter(created_at__gt=last_read)
        return qs.count()


class MessageRoomCreateSerializer(serializers.Serializer):
    """
    새 스레드 만들면서 첫 메시지 보내기
    - course_id: 어떤 강의의 메시지인지
    - name: 스레드 제목 (PDF에서 '메시지 2')
    - member_ids: 같이 넣을 유저 id 리스트 (학생/강사 여러 명 가능)
    - first_message: 첫 메시지 내용
    """
    course_id = serializers.IntegerField()
    name = serializers.CharField(max_length=100)
    member_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
    )
    first_message = serializers.CharField()

    def validate(self, attrs):
        request = self.context["request"]
        sender = request.user
        course_id = attrs["course_id"]
        member_ids = set(attrs["member_ids"])

        # 보낸 사람도 자동으로 멤버에 포함
        member_ids.add(sender.id)

        # 강의 존재 확인
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError("존재하지 않는 강의입니다.")

        # (옵션) 이 강의 수강생/강사만 선택 가능하게 제한
        valid_ids = set(
            StudentEnrollment.objects.filter(course=course)
            .values_list("student_id", flat=True)
        )
        if course.instructor_id:
            valid_ids.add(course.instructor_id)

        invalid = member_ids - valid_ids
        if invalid:
            raise serializers.ValidationError("해당 강의 수강생/강사만 선택할 수 있습니다.")

        attrs["course"] = course
        attrs["member_ids"] = member_ids
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        sender = request.user
        course = validated_data["course"]
        name = validated_data["name"]
        member_ids = validated_data["member_ids"]
        first_content = validated_data["first_message"]

        # 1) 방 생성
        room = MessageRoom.objects.create(course=course, name=name)

        # 2) 멤버 등록
        users = User.objects.filter(id__in=member_ids)
        for u in users:
            MessageRoomMember.objects.create(room=room, user=u)

        # 3) 첫 메시지 생성
        Message.objects.create(
            room=room,
            sender=sender,
            content=first_content,
        )

        return room
