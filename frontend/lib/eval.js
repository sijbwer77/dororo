// frontend/lib/eval.js

import { apiFetch } from "./api";

// ✅ 1) 강의평가 대상 강의 목록 (내 수강 강의)
export async function getMyEvalCourses() {
  // 이미 백엔드에서 쓰고 있는 엔드포인트(/api/student/courses/) 기준
  return apiFetch("/api/student/courses/");
}

// ✅ 2) 강의평가 문항 목록
export async function getEvalQuestions() {
  return apiFetch("/api/evals/questions/");
}

// ✅ 3) 강의평가 제출
// answers 예시:
// [
//   { question: 1, score: 5 },
//   { question: 2, score: 4 },
//   { question: 3, text: "의견..." }
// ]
export async function submitEvaluation(courseId, answers) {
  return apiFetch("/api/evals/responses/", {
    method: "POST",
    body: JSON.stringify({
      course_id: courseId,
      answers,
    }),
  });
}

export async function getTeacherEvalSummary() {
  return apiFetch("/api/evals/teacher/summary/");
}

// ✅ 강사용: 강의별 상세
export async function getTeacherEvalCourseDetail(courseId) {
  return apiFetch(`/api/evals/teacher/courses/${courseId}/`);
}


export async function getTeacherTestEvalCourses() {
  return apiFetch("/api/evals/teacher/test/courses/");
}

// 🔥 강사용 테스트: 나를 해당 강의의 instructor로 지정
export async function assignMyselfToEvalCourse(courseId) {
  return apiFetch("/api/evals/teacher/test/courses/assign/", {
    method: "POST",
    body: JSON.stringify({ course_id: courseId }),
  });
}