// frontend/lib/api.js
const API_BASE_URL = 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 👈 [중요] 세션 유지
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function login(username, password) {
  return fetchAPI('/api/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}