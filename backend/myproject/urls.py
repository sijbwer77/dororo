from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter



router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),

    path("api/", include("apps.users.urls")),
    path("api/", include("apps.learning.urls")),
    path("api/group/",include("apps.group.urls")),
    path('api/learning/',include('apps.learning.urls')),
    path("api/", include("apps.gamification.urls")),
    path("api/", include("apps.consultation.urls")),
    path("api/", include("apps.challenge.urls")),
    path("api/", include("apps.message.urls")),
    path("api/", include("apps.eval.urls")),
    path("api/", include("apps.schedule.urls")), 

    
    path('api/', include(router.urls)),
]
