from rest_framework import serializers


class GamificationStatusSerializer(serializers.Serializer):
    """
    My Level 화면용 응답 스키마
    """
    total_score = serializers.IntegerField()
    max_score = serializers.IntegerField()
    stage = serializers.IntegerField()
    step = serializers.IntegerField()
    global_progress = serializers.FloatField()
    step_exp_current = serializers.IntegerField()
    step_exp_max = serializers.IntegerField()
    is_clear = serializers.BooleanField()
