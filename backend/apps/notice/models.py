from django.db import models
from django.conf import settings


class Notice(models.Model):
    """
    공지사항
    파일 업로드는 안 하니까 제목/내용/작성일/수정일/핀 정도만 둠
    """

    title = models.CharField("제목", max_length=200)
    content = models.TextField("내용")

    # 나중에 작성자 표시하고 싶을 수 있으니 optional 로 둠
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="작성자",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="notices",
    )

    is_pinned = models.BooleanField("상단 고정", default=False)

    created_at = models.DateTimeField("작성일시", auto_now_add=True)
    updated_at = models.DateTimeField("수정일시", auto_now=True)

    class Meta:
        ordering = ["-is_pinned", "-created_at"]
        verbose_name = "공지사항"
        verbose_name_plural = "공지사항"

    def __str__(self) -> str:
        return self.title
