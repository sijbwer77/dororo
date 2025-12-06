from django.urls import path
from .consumers import ConsultationConsumer

websocket_urlpatterns = [
    path("ws/consultations/<int:consultation_id>/", ConsultationConsumer.as_asgi()),
]
