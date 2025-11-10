from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import LocalAccount

class StudentLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password=attrs.get("password")

        # 이메일로 유저 찾기
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("해당 이메일이 존재하지 않습니다.")
        #인증
        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("비밀번호가 올바르지 않습니다.")
        
        # 학생 아닌 경우 처리
        if not hasattr(user, "local_account") or user.local_account.role !="student":
            raise serializers.ValidationError("학생 계정만 로그인할 수 있습니다.")

        #로그인 성공 -> 토근 발급
        refresh = RefreshToken.for_user(user)

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.id,
            "nickname": user.local_account.nickname,
            "role": user.local_account.role,
        }

class StudentRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    nickname = serializers.CharField(max_length=50)
    phone_number = serializers.CharField(max_length=20)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용중인 이메일입니다.")
        return value
    
    def create(self,validate_data):
        email = validate_data['email']
        password = validate_data['password']
        nickname = validate_data['nickname']
        phone_number = validate_data['phone_number']

        user = User.objects.create(
            username=email,
            email=email,
        )
        user.set_password(password)
        user.save()

        LocalAccount.objects.create(
            user=user,
            nickname=nickname,
            phone_number=phone_number,
            role="student",
        )
        return user
