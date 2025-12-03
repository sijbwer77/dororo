// frontend/lib/messages.js
import { apiFetch } from './api';

// 1) 코스별 메시지 스레드 목록
export async function getCourseMessages(courseId) {
  return apiFetch(`/api/courses/${courseId}/messages/`, {
    method: 'GET',
  });
}

// 2) 스레드 상세 + 대화 목록
export async function getMessageThread(threadId) {
  return apiFetch(`/api/messages/${threadId}/`, {
    method: 'GET',
  });
}

// 3) 새 스레드 생성 (코스 안에서 새 문의 보내기)
export async function createMessageThread({ courseId, title, content }) {
  return apiFetch('/api/messages/', {
    method: 'POST',
    body: JSON.stringify({
      course_id: Number(courseId),
      title,
      content,
    }),
  });
}

// 4) 기존 스레드에 답장
export async function replyMessage({ threadId, content }) {
  return apiFetch(`/api/messages/${threadId}/reply/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
