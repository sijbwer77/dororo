# apps/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import LocalAccount

# --- 1. 회원가입 Serializer ---
class SignupSerializer(serializers.Serializer):
    # 프론트에서 보내주는 필드들
    username = serializers.CharField()
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    
    # 전화번호 3개로 쪼개서 옴
    phone1 = serializers.CharField()
    phone2 = serializers.CharField()
    phone3 = serializers.CharField()
    
    def validate(self, data):
        # 1. 비번 일치 확인
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("비밀번호가 서로 일치하지 않습니다.")
        
        # 2. 아이디 중복 확인
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "이미 존재하는 아이디입니다."})
            
        # 3. [추가됨] 휴대폰 번호 중복 확인 (모델 unique=True 대응)
        full_phone = f"{data['phone1']}-{data['phone2']}-{data['phone3']}"
        if LocalAccount.objects.filter(phone_number=full_phone).exists():
            raise serializers.ValidationError("이미 가입된 휴대폰 번호입니다.")
            
        return data

    def create(self, validated_data):
        # 전화번호 합치기
        phone_number = f"{validated_data['phone1']}-{validated_data['phone2']}-{validated_data['phone3']}"
        
        # User 생성 (Django 기본)
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password1'],
            first_name=validated_data['full_name'],
            email=validated_data.get('email', '')
        )
        
        # LocalAccount 생성
        role = self.context.get('role', 'SP') # 기본값 SP
        
        local_account = LocalAccount.objects.create(
            user=user,
            nickname=validated_data.get('nickname') or validated_data['full_name'],
            phone_number=phone_number,
            role=role,
            account_type="local"
        )
        return user
'''
# --- 2. 로그인 Serializer ---
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        # Django 기본 인증 함수 사용
        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError("아이디 또는 비밀번호가 올바르지 않습니다.")
        
        # LocalAccount 연결 확인
        if not hasattr(user, 'local_account'):
             raise serializers.ValidationError("유효하지 않은 계정 데이터입니다.")

        data['user'] = user
        return data
'''
# apps/users/serializers.py (LoginSerializer 부분만 수정)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        # 👇 [추가] 터미널에 입력값과 인증 결과를 찍어봅니다
        print(f"\n=== 로그인 디버깅 시작 ===")
        print(f"1. 입력받은 ID: {username}")
        print(f"2. 입력받은 PW: {password}")

        user = authenticate(username=username, password=password)
        print(f"3. 인증 결과(User): {user}") 

        if user is not None:
            # 유저가 있다면, LocalAccount가 잘 붙어있는지 확인
            has_account = hasattr(user, 'local_account')
            print(f"4. LocalAccount 연결 여부: {has_account}")
        # 👆 [여기까지 추가]

        if user is None:
            raise serializers.ValidationError("아이디 또는 비밀번호가 올바르지 않습니다.")
        
        if not hasattr(user, 'local_account'):
             raise serializers.ValidationError("유효하지 않은 계정 데이터입니다.")

        data['user'] = user
        return data