// frontend/lib/users.js

import { apiFetch } from './api';   // ✅ 공통 함수 가져오기

// --- 1. 로그인 함수 ---
export async function login(username, password) {
  return apiFetch('/api/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// --- 2. 회원가입 함수 (학생/학부모) ---
export async function signupSP(formData) {
  return apiFetch('/api/signup/sp/', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// --- 3. 회원가입 함수 (매니저) ---
export async function signupMG(formData) {
  return apiFetch('/api/signup/mg/', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// --- 4. 아이디 중복 확인 ---
export async function checkUsername(username) {
  return apiFetch(`/api/check-username/?username=${username}`, {
    method: 'GET',
  });
}

// --- 5. 로그아웃 ---
export async function logout() {
  return apiFetch('/api/logout/', {
    method: 'POST',
  });
}
