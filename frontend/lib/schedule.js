// frontend/lib/schedule.js
import { apiFetch } from './api'; // api.js 공용 함수 사용 :contentReference[oaicite:1]{index=1}

// 1) 내 일정 전체 조회 (개인 + 강의 일정 섞어서 내려온다고 가정)
/**
 * (옵션) year, month를 넘기면 쿼리스트링으로 붙여서 요청
 * ex) fetchMySchedules(2025, 12)
 */
export function fetchMySchedules(year, month) {
  let path = '/api/me/schedules/';

  if (year && month) {
    const searchParams = new URLSearchParams({
      year: String(year),
      month: String(month),
    });
    path += `?${searchParams.toString()}`;
  }

  return apiFetch(path, { method: 'GET' });
}

// 2) 새 일정 생성 (개인 일정)
export function createMySchedule(payload = {}) {
  return apiFetch('/api/me/schedules/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 3) 일정 수정 (개인 일정만)
export function updateMySchedule(id, payload = {}) {
  return apiFetch(`/api/me/schedules/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// 4) 일정 삭제 (개인 일정만)
export function deleteMySchedule(id) {
  return apiFetch(`/api/me/schedules/${id}/`, {
    method: 'DELETE',
  });
}
