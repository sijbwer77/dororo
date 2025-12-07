from django.urls import path
from . import views

app_name = "notice"

urlpatterns = [
    path("", views.NoticeListCreateAPIView.as_view(), name="notice-list"),
    path("<int:pk>/", views.NoticeRetrieveUpdateDestroyAPIView.as_view(), name="notice-detail"),
    path("bulk-delete/", views.notice_bulk_delete, name="notice-bulk-delete"),
]
