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
    credentials: 'include', // 👈 [핵심] 세션 쿠키를 주고받기 위해 필수!
  });

  const data = await res.json();

  // 백엔드에서 400, 500 에러를 주면 여기서 catch로 넘김
  if (!res.ok) {
    throw data; 
  }

  return data;
}

// --- 1. 로그인 함수 ---
export async function login(username, password) {
  return fetchAPI('/api/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// --- 2. 회원가입 함수 (학생/학부모) ---
// 입력받은 데이터(formData)에 phone1, phone2, phone3 등이 다 들어있어야 함
export async function signupSP(formData) {
  return fetchAPI('/api/signup/sp/', { // 학생은 sp
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// --- 3. 회원가입 함수 (매니저) ---
export async function signupMG(formData) {
  return fetchAPI('/api/signup/mg/', { // 매니저는 mg
    method: 'POST',
    body: JSON.stringify(formData),
  });
}

// --- 4. 아이디 중복 확인 ---
export async function checkUsername(username) {
  return fetchAPI(`/api/check-username/?username=${username}`, {
    method: 'GET',
  });
}

// --- 5. 로그아웃 ---
export async function logout() {
  return fetchAPI('/api/logout/', {
    method: 'POST',
  });
}