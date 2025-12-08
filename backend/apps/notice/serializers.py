from rest_framework import serializers
from .models import Notice


class NoticeSerializer(serializers.ModelSerializer):
    """
    공지사항 단일/목록 공용 serializer
    프론트에서 쓰기 좋은 date, preview 필드 추가
    """

    date = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()

    class Meta:
        model = Notice
        # content 를 같이 내려주면 관리 페이지에서 펼쳤을 때 바로 사용 가능
        fields = [
            "id",
            "title",
            "content",
            "date",
            "preview",
            "is_pinned",
        ]

    def get_date(self, obj):
        # created_at -> "YYYY-MM-DD"
        if obj.created_at:
            return obj.created_at.date().isoformat()
        return None

    def get_preview(self, obj):
        """
        내용의 첫 줄을 잘라 preview 로 사용
        (프론트에서 지금 쓰는 preview 역할)
        """
        if not obj.content:
            return ""
        first_line = obj.content.splitlines()[0]
        if len(first_line) > 80:
            return first_line[:80] + "..."
        return first_line
