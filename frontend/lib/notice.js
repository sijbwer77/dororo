// frontend/lib/notice.js
import { apiFetch } from './api';

// 1-1 공지 목록 조회
export function fetchNotices() {
  return apiFetch('/api/notices/', { method: 'GET' });
}

// 1-2 공지 생성
// payload 예시: { title: '제목', content: '내용', is_pinned: true }
export function createNotice(payload = {}) {
  return apiFetch('/api/notices/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 1-3 공지 상세 조회 (필요하면 사용)
export function fetchNoticeDetail(id) {
  return apiFetch(`/api/notices/${id}/`, { method: 'GET' });
}

// 1-4 공지 수정 (필요하면 사용)
export function updateNotice(id, payload = {}) {
  return apiFetch(`/api/notices/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// 1-5 공지 단일 삭제
export function deleteNotice(id) {
  return apiFetch(`/api/notices/${id}/`, { method: 'DELETE' });
}

// 1-6 공지 여러 개 한 번에 삭제
export function bulkDeleteNotices(ids = []) {
  return apiFetch('/api/notices/bulk-delete/', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}
