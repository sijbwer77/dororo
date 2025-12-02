// frontend/lib/gamification.js

const API_BASE_URL = 'http://localhost:8000';


// 이 파일 안에서만 쓰는 공용 fetch 헬퍼
async function gamificationFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // 세션 쿠키
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

// --- My Level ---
export async function getMyLevel() {
  return gamificationFetch('/api/gamification/my-level/', {
    method: 'GET',
  });
}

// --- 출석 맵 (1~6일차) ---
export async function getAttendanceMap() {
  return gamificationFetch('/api/gamification/attendance-map/', {
    method: 'GET',
  });
}

// --- 오늘 출석 상태 ---
export async function getTodayAttendance() {
  return gamificationFetch('/api/gamification/today-attendance/', {
    method: 'GET',
  });
}

// --- 오늘 출석 도장 찍기 ---
export async function stampTodayAttendance() {
  return gamificationFetch('/api/gamification/today-attendance/', {
    method: 'POST',
  });
}
