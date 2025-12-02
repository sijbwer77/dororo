// frontend/lib/api.js

const API_BASE_URL = 'http://localhost:8000';

// --- 쿠키에서 csrftoken 읽기 ---
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function isSafeMethod(method) {
  return ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method);
}

// ✅ 앞으로 모든 API 요청은 이 함수만 쓰면 됨
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // GET/HEAD 말고 POST/PUT/DELETE 에만 CSRF 헤더 붙이기
  if (!isSafeMethod(method)) {
    const csrftoken = getCookie('csrftoken');
    if (csrftoken) {
      headers['X-CSRFToken'] = csrftoken;
    }
  }

  const res = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include', // 세션 쿠키 포함
  });

  const contentType = res.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = { detail: text };
  }

  if (!res.ok) {
    throw data;
  }

  return data;
}

// 🔹 원하면 여기서 CSRF 쿠키만 따로 받아오는 함수도 제공
export async function ensureCsrfCookie() {
  await fetch(`${API_BASE_URL}/api/csrf/`, {
    method: 'GET',
    credentials: 'include',
  });
}
