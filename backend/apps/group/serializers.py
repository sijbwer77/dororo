from rest_framework import serializers
from .models import Group, GroupMember, Document, GroupFile

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name", "course", "created_at")


class GroupMemberSerializer(serializers.ModelSerializer):
    group = GroupSerializer()

    class Meta:
        model = GroupMember
        fields = ("id", "group")

from .models import GroupFile

from django.conf import settings

class GroupFileSerializer(serializers.ModelSerializer):
    uploader_name = serializers.CharField(source="uploader.local_account.nickname", read_only=True)
    filename = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GroupFile
        fields = ["id", "filename", "file_url", "uploader_name", "created_at"]

    def get_filename(self, obj):
        return obj.file.name.split("/")[-1]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "group",
            "parent",
            "block_type",
            "content",
            "file",
            "order_index",
            "created_at",
        ]
        read_only_fields = ["id", "group", "created_at"]

