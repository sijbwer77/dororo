from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import StudentSignUpSerializer

class StudentSignUpAPI(generics.GenericAPIView):
    """
    Student SignUp Api
    """
    serializer_class = StudentSignUpSerializer
    authentication_classes = []   # 브라우저에서 편하게 테스트
    permission_classes = []

    def get(self, request):
        # GET으로 들어오면 DRF가 아래 serializer를 기반으로 폼 UI를 렌더링함
        return Response({})

    def post(self, request):
        s = self.get_serializer(data=request.data)
        if s.is_valid():
            user = s.save()
            return Response({"message": "signup_ok", "user_id": user.id},
                            status=status.HTTP_201_CREATED)
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

# urls에서 함수처럼 쓸 수 있게 export(선택)
student_signup_api = StudentSignUpAPI.as_view()
