import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from .models import Group, GroupMessage


class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        self.room_name = f"group_{self.group_id}"

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        """
        클라이언트에서 보내는 payload 예시:
        { "message": "안녕" }
        """
        data = json.loads(text_data)
        message = data.get("message")
        user = self.scope["user"]

        if not message or isinstance(user, AnonymousUser):
            # 로그인 안 돼 있으면 무시
            return

        # 그룹 객체 가져오기
        group = await Group.objects.aget(id=self.group_id)

        # 메시지 저장
        saved = await GroupMessage.objects.acreate(
            group=group,
            user=user,
            content=message,
            created_at=timezone.now(),
        )

        # 같은 그룹 모든 클라이언트에게 전송
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                "id": saved.id,
                "sender": user.username,
                "text": message,
                "time": saved.created_at.strftime("%H:%M"),
            },
        )

    async def chat_message(self, event):
        # 브라우저로 그대로 JSON 전송
        await self.send(text_data=json.dumps(event))
