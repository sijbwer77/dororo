from rest_framework import serializers

from .models import Consultation, ConsultationMessage


class ConsultationMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationMessage
        fields = ["id", "sender_type", "text", "created_at"]


class ConsultationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    last_message_sender_type = serializers.SerializerMethodField()

    class Meta:
        model = Consultation
        fields = [
            "id",
            "title",
            "status",
            "last_message",
            "last_message_at",
            "last_message_sender_type",
            "created_at",
        ]

    def get_last_message(self, obj):
        message = getattr(obj, "_latest_message", None)
        if message:
            return message.text
        latest = obj.messages.order_by("-created_at").first()
        return latest.text if latest else None

    def get_last_message_at(self, obj):
        message = getattr(obj, "_latest_message", None)
        if message:
            return message.created_at
        latest = obj.messages.order_by("-created_at").first()
        return latest.created_at if latest else None

    def get_last_message_sender_type(self, obj):
        message = getattr(obj, "_latest_message", None)
        if message:
            return message.sender_type
        latest = obj.messages.order_by("-created_at").first()
        return latest.sender_type if latest else None


class ConsultationDetailSerializer(serializers.ModelSerializer):
    student = serializers.SerializerMethodField()
    messages = ConsultationMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Consultation
        fields = ["id", "title", "status", "created_at", "messages", "student"]

    def get_student(self, obj):
        user = getattr(obj, "user", None)
        if not user:
            return None
        local = getattr(user, "local_account", None)
        return {
            "id": user.id,
            "username": user.username,
            "full_name": user.first_name,
            "nickname": local.nickname if local else "",
            "phone_number": local.phone_number if local else "",
        }
