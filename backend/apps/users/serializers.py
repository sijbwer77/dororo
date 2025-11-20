<<<<<<< HEAD
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers

from .models import LocalAccount

User = get_user_model()


class LocalAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalAccount
        fields = ['phone_number', 'nickname', 'type', 'role']


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

    def create(self, validated_data):
        role = self.context.get('role')  # 'sp' or 'mg'

        phone = f"{validated_data.pop('phone1')}-" \
                f"{validated_data.pop('phone2')}-" \
                f"{validated_data.pop('phone3')}"

        password = validated_data.pop('password1')
        validated_data.pop('password2')

        nickname = validated_data.pop('nickname', None)
        full_name = validated_data.pop('full_name')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=password,
            first_name=full_name,
            email=validated_data.get('email', '')
        )

        LocalAccount.objects.create(
            user=user,
            phone_number=phone,
            nickname=nickname or full_name,
            type='local',
            role='SP' if role == 'sp' else 'MG',
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
=======
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
>>>>>>> main
