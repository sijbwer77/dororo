from rest_framework import serializers
from .models import Group, GroupMember

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name", "course", "created_at")


class GroupMemberSerializer(serializers.ModelSerializer):
    group = GroupSerializer()

    class Meta:
        model = GroupMember
        fields = ("id", "group")
