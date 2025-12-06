// app/teacher/eval-test/page.js
"use client";

import { useEffect, useState } from "react";
import {
  getTeacherTestEvalCourses,
  assignMyselfToEvalCourse,
} from "@/lib/eval";

export default function TeacherEvalTestPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeacherTestEvalCourses();
      setCourses(data || []);
    } catch (err) {
      console.error(err);
      setError(err.detail || "강의 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAssign = async (courseId) => {
    try {
      setSavingId(courseId);
      setError(null);
      await assignMyselfToEvalCourse(courseId);
      await loadCourses();
    } catch (err) {
      console.error(err);
      setError(
        err.detail ||
          "강사 지정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main style={{ padding: "32px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        강의평가 테스트용 강의 연결
      </h1>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        아래 강의들 중에서 &quot;내가 강사로 지정&quot; 버튼을 눌러서
        테스트용으로 instructor를 설정하세요.
        <br />
        이렇게 연결된 강의만 /admin/eval 강의평가 대시보드에 표시됩니다.
      </p>

      {loading && <p>불러오는 중...</p>}
      {error && !loading && (
        <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>
      )}

      {!loading && !error && (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>강의명</th>
              <th style={thStyle}>분류</th>
              <th style={thStyle}>상태</th>
              <th style={thStyle}>현재 강사</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "16px", textAlign: "center" }}>
                  등록된 강의가 없습니다.
                </td>
              </tr>
            )}

            {courses.map((c) => (
              <tr key={c.id}>
                <td style={tdStyle}>{c.id}</td>
                <td style={tdStyle}>{c.title}</td>
                <td style={tdStyle}>{c.course_type || "-"}</td>
                <td style={tdStyle}>{c.status}</td>
                <td style={tdStyle}>{c.instructor || "-"}</td>
                <td style={tdStyle}>
                  {c.is_mine ? (
                    <span style={{ color: "green", fontWeight: 600 }}>
                      내 강의
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAssign(c.id)}
                      disabled={savingId === c.id}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        border: "1px solid #007bff",
                        background: "#007bff",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {savingId === c.id ? "처리 중..." : "내가 강사로 지정"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  fontSize: "13px",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #ddd",
  fontSize: "13px",
};
