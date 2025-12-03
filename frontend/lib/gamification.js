// frontend/lib/gamification.js

import { apiFetch } from './api';  // ✅ 공통 api 함수 사용

// 출석 6칸 상태
export function getAttendanceStatus() {
  return apiFetch('/api/attendance/status/', {
    method: 'GET',
  });
}

// 내 레벨 정보
export function getMyLevel() {
  return apiFetch('/api/me/level/', {
    method: 'GET',
  });
}

// 오늘 출석 도장 조회
export function getTodayAttendance() {
  return apiFetch('/api/gamification/today-attendance/', {
    method: 'GET',
  });
}

// 오늘 출석 도장 찍기 (POST)
export function stampTodayAttendance() {
  return apiFetch('/api/gamification/today-attendance/', {
    method: 'POST',
  });
}
