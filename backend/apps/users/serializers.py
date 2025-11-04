from django.contrib.auth.models import User
from rest_framework import serializers
from .models import LocalAccount

class StudentSignUpSerializer(serializers.Serializer):
    username     = serializers.CharField(max_length=150)
    email        = serializers.EmailField(required=False, allow_blank=True)
    password1    = serializers.CharField(write_only=True)
    password2    = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=20)
    nickname     = serializers.CharField(max_length=50)
    type         = serializers.CharField(max_length=50, default="local")
    role         = serializers.CharField(max_length=50, default="student")

    def validate(self, attrs):
        if attrs["password1"] != attrs["password2"]:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError("이미 사용중인 사용자명입니다.")
        if LocalAccount.objects.filter(phone_number=attrs["phone_number"]).exists():
            raise serializers.ValidationError("이미 등록된 전화번호입니다.")
        return attrs

    def create(self, v):
        user = User.objects.create_user(
            username=v["username"], email=v.get("email", ""), password=v["password1"]
        )
        LocalAccount.objects.create(
            user=user,
            phone_number=v["phone_number"],
            nickname=v["nickname"],
            type=v.get("type", "local"),
            role=v.get("role", "student"),
        )
        return user
