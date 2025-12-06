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

from rest_framework import serializers
from .models import GroupFile

class GroupFileSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source="uploader.local_account.nickname", read_only=True)
    filename = serializers.SerializerMethodField()

    class Meta:
        model = GroupFile
        fields = ["id", "filename", "file", "uploader_name", "created_at"]

    def get_filename(self, obj):
        return obj.file.name.split("/")[-1]

