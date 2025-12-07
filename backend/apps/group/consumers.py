# apps/group/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from .models import Group, GroupMessage


class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # URL에서 group_id 가져오기 (/ws/group/<group_id>/)
        self.group_id = self.scope["url_route"]["kwargs"]["group_id"]
        self.room_name = f"group_{self.group_id}"

        # 같은 그룹 사람들끼리 같은 room_name 으로 묶기
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # 연결 끊길 때 room 에서 빼주기
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        """
        클라이언트가 보낸 메시지를 받는 부분
        1) JSON 파싱
        2) 로그인 유저/그룹 체크
        3) DB에 GroupMessage 저장
        4) 같은 room 에 모두에게 브로드캐스트
        """
        print(">>> receive called:", text_data)  # 디버깅용 로그

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            print(">>> invalid json")
            return

        message = (data.get("message") or "").strip()
        user = self.scope.get("user")

        if not message:
            print(">>> empty message, ignore")
            return

        # 로그인 안 돼 있으면 무시 (테스트 시 주석처리)
        if isinstance(user, AnonymousUser):
            print(">>> AnonymousUser, ignore")
            return

        # group 존재하는지 확인
        try:
            group = await Group.objects.aget(id=self.group_id)
        except Group.DoesNotExist:
            print(">>> group not found:", self.group_id)
            return

        # DB 저장
        saved = await GroupMessage.objects.acreate(
            group=group,
            user=user,
            content=message,
        )

        # 같은 room 에 모두에게 브로드캐스트
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "chat_message",
                "id": saved.id,
                "sender": user.username,
                "text": saved.content,
                "time": timezone.localtime(saved.created_at).strftime("%H:%M"),
            },
        )

    async def chat_message(self, event):
        """
        group_send 로 넘어온 이벤트를 실제 브라우저로 보내는 부분
        여기서 "이 소켓 유저가 보낸 메시지인지"를 계산해서 is_me 플래그를 붙인다.
        """
        user = self.scope.get("user", None)

        is_me = False
        if user and not isinstance(user, AnonymousUser):
            # 이 소켓에 연결된 유저와 sender 가 같으면 내 메시지
            is_me = (user.username == event.get("sender"))

        payload = {
            "type": "chat_message",
            "id": event["id"],
            "sender": event["sender"],
            "text": event["text"],
            "time": event["time"],
            "is_me": is_me,
        }

        await self.send(text_data=json.dumps(payload))
