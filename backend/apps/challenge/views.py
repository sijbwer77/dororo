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
    """
    GET /api/student/challenge/
    - 로그인 유저의 LocalAccount.solvedac_handel 사용해서 solved.ac 호출
    """

    permission_classes = [IsAuthenticated]

    def get_solvedac_handle(self, user) -> str:
        """
        LocalAccount.solvedac_handel → solved.ac 아이디.
        없으면 user.username 사용.
        """
        try:
            local = user.local_account  # related_name='local_account'
        except LocalAccount.DoesNotExist:
            return user.username

        # 필드 이름: solvedac_handel (오타 그대로)
        if local.solvedac_handel:
            return local.solvedac_handel

        return user.username

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
