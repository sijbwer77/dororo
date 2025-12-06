import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ConsultationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.consultation_id = self.scope["url_route"]["kwargs"]["consultation_id"]
        self.group_name = f"consultation_{self.consultation_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # 서버 푸시용이므로 클라이언트→서버 메시지는 무시
        return

    async def consultation_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))
