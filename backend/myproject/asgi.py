# myproject/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

django_asgi_app = get_asgi_application()

# 🔹 settings 로드된 다음에 import 해야 함
import apps.group.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.group.routing.websocket_urlpatterns
        )
    ),
})
