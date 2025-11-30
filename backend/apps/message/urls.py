# apps/message/urls.py
from rest_framework.routers import DefaultRouter
from .views import MessageRoomViewSet, MessageViewSet

router = DefaultRouter()
router.register(r"rooms", MessageRoomViewSet, basename="message-room")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = router.urls
