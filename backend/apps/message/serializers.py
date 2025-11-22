from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import MessageRoom, Message, MessageRoomMember

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):
    # LocalAccount가 있으면 거기서 nickname, role 뽑고
    # 없어도 에러 안 나게 안전하게 처리
    nickname = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'nickname', 'role')

    def get_nickname(self, obj):
        local = getattr(obj, 'local_account', None)
        return getattr(local, 'nickname', None)

    def get_role(self, obj):
        local = getattr(obj, 'local_account', None)
        return getattr(local, 'role', None)


class MessageSerializer(serializers.ModelSerializer):
    sender = SimpleUserSerializer(read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id',
            'room',
            'sender',
            'content',
            'created_at',
            'updated_at',
            'is_mine',
        )
        read_only_fields = ('id', 'sender', 'created_at', 'updated_at', 'is_mine')

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return False
        return obj.sender_id == request.user.id


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('room', 'content')


class MessageRoomSerializer(serializers.ModelSerializer):
    members = SimpleUserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = MessageRoom
        fields = (
            'id',
            'name',
            'members',
            'created_at',
            'updated_at',
            'last_message',
        )

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if not last_msg:
            return None
        return MessageSerializer(last_msg, context=self.context).data


class MessageRoomCreateSerializer(serializers.ModelSerializer):
    # 같이 들어갈 유저 id 리스트
    member_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
    )

    class Meta:
        model = MessageRoom
        fields = ('id', 'name', 'member_ids')

    def create(self, validated_data):
        request = self.context['request']
        creator = request.user
        member_ids = set(validated_data.pop('member_ids', []))
        member_ids.add(creator.id)

        room = MessageRoom.objects.create(**validated_data)

        users = User.objects.filter(id__in=member_ids)
        for u in users:
            MessageRoomMember.objects.create(room=room, user=u)

        return room
