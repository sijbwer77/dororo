# challenge/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.users.models import LocalAccount
from .services import (
    fetch_solvedac_user,
    build_challenge_payload,
    SolvedAcAPIError,
)


class ChallengeView(APIView):
    permission_classes = [IsAuthenticated]

    def get_solvedac_handle(self, user) -> str:
        """
        매 요청마다 DB에서 LocalAccount를 직접 읽어서
        solvedac_handel 을 가져온다.
        - 전역 변수, 캐시 일절 사용 X
        - 레코드 없거나 값이 비어 있으면 username 사용
        """
        try:
            local = LocalAccount.objects.get(user_id=user.id)
        except LocalAccount.DoesNotExist:
            handle = user.username
        else:
            handle = local.solvedac_handel or user.username

        # 무슨 값이 실제로 쓰였는지 서버 콘솔에서 보라고 디버그 로그 찍기
        print(
            f"DEBUG >> challenge handle: user_id={user.id}, "
            f"username={user.username}, handle={handle!r}"
        )
        return handle

    def get(self, request):
        handle = self.get_solvedac_handle(request.user)

        try:
            solvedac_user = fetch_solvedac_user(handle)
        except SolvedAcAPIError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            return Response(
                {"detail": f"unexpected error: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        payload = build_challenge_payload(solvedac_user)
        return Response(payload, status=status.HTTP_200_OK)
