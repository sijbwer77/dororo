# apps/schedule/serializers.py
from rest_framework import serializers
from .models import ScheduleEvent

class ScheduleEventSerializer(serializers.ModelSerializer):
    # course 관련 정보는 하나의 객체로 묶어서 내려주기
    course = serializers.SerializerMethodField()

    class Meta:
        model = ScheduleEvent
        fields = (
            "id",
            "date",
            "start_time",
            "end_time",
            "title",
            "description",
            "status",
            "type",
            "course",
        )
        read_only_fields = ("id", "type")

    def get_course(self, obj):
        if not obj.course_id:
            return None
        return {
            "id": obj.course_id,
            "name": obj.course_name,
            "color": obj.course_color,
        }

    def create(self, validated_data):
        """
        /api/me/schedules 로 들어오는 건 '개인 일정'만 생성되도록 고정
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)

        validated_data["user"] = user
        validated_data["type"] = "personal"  # 강의 일정은 서버에서만 생성

        # course_* 필드는 personal 일정에서는 굳이 안 씀
        validated_data.pop("course_id", None)
        validated_data.pop("course_name", None)
        validated_data.pop("course_color", None)

        return super().create(validated_data)

    def validate(self, attrs):
        """
        강의 일정(type=course)은 수정/삭제 못하게 막기 (나중에 세션에서 생성된 경우 대비)
        """
        instance = getattr(self, "instance", None)
        request = self.context.get("request")

        if instance and instance.type == "course":
            if request and request.method in ("PUT", "PATCH", "DELETE"):
                raise serializers.ValidationError("강의 일정은 수정할 수 없습니다.")

        return attrs
