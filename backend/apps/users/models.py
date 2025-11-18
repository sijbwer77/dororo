# backend/apps/users/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class LocalAccount(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='local_account',
        db_column='user_id',
    )
    phone_number = models.CharField(max_length=20)
    nickname = models.CharField(max_length=50)
    type = models.CharField(max_length=20)   # 필요하면 'student', 'parent' 등으로 사용
    role = models.CharField(max_length=20)   # 'SP'(학생/학부모), 'MG'(매니저) 등
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'local_account'


class SocialAccount(models.Model):
    # ERD 상에 id / user_id / id_hash / social_id / provider
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_accounts',
        db_column='user_id',
    )
    id_hash = models.CharField(max_length=200)
    social_id = models.CharField(max_length=200)
    provider = models.CharField(max_length=50)

    class Meta:
        db_table = 'social_account'
