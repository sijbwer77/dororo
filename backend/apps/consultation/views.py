from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Consultation, ConsultationMessage
from .serializers import (
    ConsultationDetailSerializer,
    ConsultationListSerializer,
    ConsultationMessageSerializer,
)


def _is_admin(user):
    """
    관리자 여부 판단.
    - 장고 is_staff 이거나 LocalAccount.role == 'MG' 로 보면 됨.
    """
    try:
        local_role = getattr(user, "local_account", None)
        return bool(user.is_staff or (local_role and local_role.role == "MG"))
    except Exception:
        return user.is_staff


class ConsultationListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, user):
        qs = Consultation.objects.all()
        if not _is_admin(user):
            qs = qs.filter(user=user)

        # 최신 메시지를 미리 가져와서 serializer에서 사용
        latest_message_prefetch = Prefetch(
            "messages",
            queryset=ConsultationMessage.objects.order_by("-created_at"),
            to_attr="prefetched_messages",
        )
        qs = qs.prefetch_related(latest_message_prefetch)
        return qs

    def get(self, request):
        consultations = self.get_queryset(request.user)

        # serializer에서 첫 메시지만 쓰도록 _latest_message 세팅
        for c in consultations:
            prefetched = getattr(c, "prefetched_messages", [])
            c._latest_message = prefetched[0] if prefetched else None

        serializer = ConsultationListSerializer(consultations, many=True)
        return Response(serializer.data)

    def post(self, request):
        title = request.data.get("title", "").strip()
        first_message = request.data.get("first_message", "").strip()

        if not title and first_message:
            title = first_message[:30]

        consultation = Consultation.objects.create(
            user=request.user,
            title=title,
        )

        # 첫 메시지 생성 시 최근 메시지 시각 업데이트
        if first_message:
            message = ConsultationMessage.objects.create(
                consultation=consultation,
                sender_type="student" if not _is_admin(request.user) else "admin",
                text=first_message,
            )
            consultation.last_message_at = message.created_at
            consultation.save(update_fields=["last_message_at"])

        serializer = ConsultationDetailSerializer(consultation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConsultationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        qs = Consultation.objects.prefetch_related("messages")
        if _is_admin(request.user):
            return get_object_or_404(qs, pk=pk)
        return get_object_or_404(qs, pk=pk, user=request.user)

    def get(self, request, consultation_id):
        consultation = self.get_object(request, consultation_id)
        serializer = ConsultationDetailSerializer(consultation)
        return Response(serializer.data)

    def delete(self, request, consultation_id):
        consultation = self.get_object(request, consultation_id)
        consultation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ConsultationCloseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, consultation_id):
        consultation = get_object_or_404(
            Consultation,
            pk=consultation_id,
            **({} if _is_admin(request.user) else {"user": request.user}),
        )
        consultation.status = Consultation.Status.DONE
        consultation.save(update_fields=["status"])
        return Response(
            {"id": consultation.id, "status": consultation.status},
            status=status.HTTP_200_OK,
        )


class ConsultationMessageCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, consultation_id):
        consultation = get_object_or_404(
            Consultation,
            pk=consultation_id,
            **({} if _is_admin(request.user) else {"user": request.user}),
        )

        text = (request.data.get("text") or "").strip()
        if not text:
            return Response(
                {"detail": "text is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sender_type = "admin" if _is_admin(request.user) else "student"
        message = ConsultationMessage.objects.create(
            consultation=consultation,
            sender_type=sender_type,
            text=text,
        )

        consultation.last_message_at = message.created_at
        consultation.save(update_fields=["last_message_at"])

        return Response(
            ConsultationMessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )
