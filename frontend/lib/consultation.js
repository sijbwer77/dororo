// frontend/lib/consultation.js
import { apiFetch } from './api';

// 3-1 목록 조회
export function fetchConsultations() {
  return apiFetch('/api/consultations/', { method: 'GET' });
}

// 3-2 새 상담 생성 (title, first_message 둘 다 선택사항)
export function createConsultation(payload = {}) {
  return apiFetch('/api/consultations/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// 3-3 상담 상세 조회
export function fetchConsultationDetail(id) {
  return apiFetch(`/api/consultations/${id}/`, { method: 'GET' });
}

// 3-4 상담 메시지 전송
export function sendConsultationMessage(id, text) {
  return apiFetch(`/api/consultations/${id}/messages/`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// 3-5 상담 종료
export function closeConsultation(id) {
  return apiFetch(`/api/consultations/${id}/close/`, { method: 'POST' });
}

// 3-6 상담 삭제
export function deleteConsultation(id) {
  return apiFetch(`/api/consultations/${id}/`, { method: 'DELETE' });
}
