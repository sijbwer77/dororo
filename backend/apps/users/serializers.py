from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

from .models import LocalAccount

User = get_user_model()


class LocalAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalAccount
        fields = [
            'phone_number',
            'nickname',
            'account_type',   # ✅ type -> account_type
            'role',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    local_account = LocalAccountSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'email', 'local_account']


class SignupSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=50)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    phone1 = serializers.CharField(write_only=True)
    phone2 = serializers.CharField(write_only=True)
    phone3 = serializers.CharField(write_only=True)

    nickname = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "이미 존재하는 아이디입니다. 아이디를 다시 설정해주세요."
            )
        return value

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("비밀번호가 서로 일치하지 않습니다.")
        return attrs

    # serializers.py - create()
    def create(self, validated_data):
        role = self.context.get('role')  # 'sp' or 'mg'

        phone = (
            f"{validated_data.pop('phone1')}-"
            f"{validated_data.pop('phone2')}-"
            f"{validated_data.pop('phone3')}"
        )

        password = validated_data.pop('password1')
        validated_data.pop('password2')

        nickname = validated_data.pop('nickname', None)
        full_name = validated_data.pop('full_name')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=password,
            first_name=full_name,
            email=validated_data.get('email', ''),
        )

        LocalAccount.objects.create(
            user=user,
            phone_number=phone,
            nickname=nickname or full_name,
            account_type='local',
            role='SP' if role == 'sp' else 'MG',   # 🔥 역할 저장
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("아이디 또는 비밀번호가 올바르지 않습니다.")

        attrs['user'] = user
        return attrs
