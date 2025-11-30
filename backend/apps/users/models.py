from django.db import models
from django.conf import settings


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class LocalAccount(TimeStampedModel):
    class Role(models.TextChoices):
        STUDENT_PARENT = 'SP', '학생/학부모'
        MANAGER = 'MG', '매니저'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='local_account',
        db_column='user_id',
    )
    phone_number = models.CharField(max_length=20, unique=True)
    nickname = models.CharField(max_length=50)
    account_type = models.CharField(max_length=20, default='local')
    role = models.CharField(max_length=20, choices=Role.choices)

    class Meta:
        db_table = 'local_account'


class SocialAccount(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='social_accounts',
        db_column='user_id',
    )
    id_hash = models.CharField(max_length=200)
    social_id = models.CharField(max_length=200)
    provider = models.CharField(max_length=50)

    class Meta:
        db_table = 'social_account'