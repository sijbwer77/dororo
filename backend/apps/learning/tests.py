# apps/learning/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Course

class CourseModelTest(TestCase):
    def test_str_and_ordering(self):
        u = User.objects.create(username="t1")
        c1 = Course.objects.create(title="B course", instructor=u)
        c2 = Course.objects.create(title="A course", instructor=u)
        self.assertEqual(str(c1), "B course")
        # Meta.ordering = ['-created_at'] 확인
        titles = list(Course.objects.values_list("title", flat=True))
        self.assertEqual(titles, [c2.title, c1.title] if c2.created_at > c1.created_at else [c1.title, c2.title])

class CourseAPITest(APITestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(username="teacher", password="pw")
        self.u2 = User.objects.create_user(username="other", password="pw")

    def test_list_open(self):
        res = self.client.get("/api/courses/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_sets_instructor_when_missing(self):
        self.client.login(username="teacher", password="pw")
        res = self.client.post("/api/courses/", {"title": "New Course"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["instructor"], self.u1.id)

    def test_update_only_instructor_or_admin(self):
        self.client.login(username="teacher", password="pw")
        res = self.client.post("/api/courses/", {"title": "Owned"}, format="json")
        cid = res.data["id"]
        # 다른 사용자로 수정 시도 → 403
        self.client.logout()
        self.client.login(username="other", password="pw")
        res2 = self.client.patch(f"/api/courses/{cid}/", {"title": "Hacked"}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)
