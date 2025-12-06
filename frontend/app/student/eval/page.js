// app/student/eval/page.js
"use client";

import { useEffect, useState } from "react";
import layoutStyles from "../dimc/dimc.module.css"; // DIMC / 결과 페이지랑 같은 사이드바 레이아웃
import styles from "./eval.module.css";
import Image from "next/image";
import SideBarFooter from "@/components/SideBarFooter";
import { usePathname } from "next/navigation";
import ScoreCircles from "@/components/ScoreCircles";
import { useRouter } from "next/navigation";



import {
  getMyEvalCourses,
  getEvalQuestions,
  submitEvaluation,
} from "@/lib/eval";

// 사이드바 메뉴
const SidebarMenus = [{ text: "강의 평가", href: "/student/eval" }];

// ────────────────────── 드래그 가능한 평가 모달 ──────────────────────
function EvalModal({
  visible,
  course,
  questions,
  onClose,
  onSubmit,
  submitting,
}) {
  const [position, setPosition] = useState({ x: 520, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 질문별 답변 (점수 또는 텍스트)
  const [answers, setAnswers] = useState([]);

  // 모달 열릴 때마다 질문 개수에 맞춰 초기화
  useEffect(() => {
    if (visible && questions && questions.length > 0) {
      setAnswers(Array(questions.length).fill(0));
    }
  }, [visible, questions]);

  if (!visible || !course) return null;

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // 점수형 문항 변경
  const handleScoreChange = (idx, newValue) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = newValue;
      return copy;
    });
  };

  // 서술형 문항 변경
  const handleTextChange = (idx, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleSubmit = async () => {
    // 백엔드로 보낼 answers 형태로 가공
    const payloadAnswers = questions.map((q, idx) => {
      const value = answers[idx];

      if (q.is_text) {
        return { question: q.id, text: value || "" };
      }
      return { question: q.id, score: value || 0 };
    });

    // 점수 0 & 빈 문자열만 있는 항목은 날리기
    const filtered = payloadAnswers.filter(
      (a) =>
        (typeof a.score === "number" && a.score > 0) ||
        (typeof a.text === "string" && a.text.trim() !== "")
    );

    if (filtered.length === 0) {
      alert("하나 이상 응답을 선택하거나 입력해주세요.");
      return;
    }

    await onSubmit(filtered);
  };

  return (
    <div
      className={styles.modalOverlay}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className={styles.modalWindow}
        style={{ left: position.x, top: position.y }}
      >
        {/* 헤더(드래그 영역) */}
        <div className={styles.modalHeader} onMouseDown={handleMouseDown}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalCourseTitle}>{course.title}</div>
            <div className={styles.modalTeacher}>
              강사:{" "}
              {course.instructor_name ||
                course.teacher_name ||
                course.teacher ||
                "-"}
            </div>
          </div>

          <div className={styles.modalHeaderRight}>
            <div className={styles.scaleBox}>
              <div className={styles.scaleNumbers}>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={onClose}
              disabled={submitting}
            >
              ✕
            </button>
          </div>
        </div>

        {/* 설문 내용 */}
        <div className={styles.modalBody}>
          {questions.map((q, idx) => (
            <div key={q.id} className={styles.questionRow}>
              <div className={styles.questionText}>{q.text}</div>

              {q.is_text ? (
                <textarea
                  className={styles.commentInput}
                  value={answers[idx] || ""}
                  onChange={(e) => handleTextChange(idx, e.target.value)}
                  placeholder="자유롭게 의견을 작성해주세요."
                />
              ) : (
                <ScoreCircles
                  value={answers[idx] || 0}
                  onChange={(newValue) => handleScoreChange(idx, newValue)}
                />
              )}
            </div>
          ))}
        </div>

        {/* 완료 버튼 */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "제출 중..." : "완료"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────── 메인 페이지 ──────────────────────
export default function LectureEvalPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogoClick = () => {
    setShowLogoutModal(true);
  };
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/");
  };
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };  

  const [openedCourse, setOpenedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // 초기 로딩: 내 강의 + 평가 문항
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [courseData, questionData] = await Promise.all([
          getMyEvalCourses(),  // 수강한 강의 중 평가 대상 리스트
          getEvalQuestions(),  // 평가 문항 리스트
        ]);

        setCourses(courseData || []);
        setQuestions(questionData || []);
      } catch (err) {
        console.error(err);
        setError(
          err.detail || "강의 평가 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const openModal = (course) => {
    setMessage(null);
    setError(null);
    setOpenedCourse(course);
  };

  const closeModal = () => {
    setOpenedCourse(null);
  };

  // 실제 평가 제출
  const handleSubmitEvaluation = async (answersPayload) => {
    if (!openedCourse) return;

    try {
      setSubmitting(true);
      setError(null);

      await submitEvaluation(openedCourse.id, answersPayload);

      setMessage("평가가 정상적으로 제출되었습니다.");

      // 제출한 강의는 리스트에서 빼버리기 (원하면)
      setCourses((prev) => prev.filter((c) => c.id !== openedCourse.id));

      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.detail || "평가 제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <div className={layoutStyles.pageLayout}>
      {/* 1. 왼쪽 사이드바 (DIMC랑 동일 구조) */}
      <nav className={layoutStyles.sidebar}>
        <div className={layoutStyles.sidebarTop}>
          <div 
            className={layoutStyles.sidebarLogo}
            onClick={handleLogoClick}
            style={{cursor: "pointer"}}
          >
            <Image
              src="/doro-logo.svg"
              alt="DORO 로고"
              width={147}
              height={38}
            />
          </div>
          <div className={layoutStyles.profileIcon}>
            <Image
              src="/profile-circle.svg"
              alt="Profile"
              width={184}
              height={184}
            />
          </div>
        </div>

        <div className={layoutStyles.sidebarMainGroup}>
          <div className={layoutStyles.sidebarTitleContainer}>
            <div className={layoutStyles.sidebarTitleIcon}>
              <Image
                src="/Task.svg"
                alt="강의평가 아이콘"
                width={25}
                height={32}
              />
            </div>
            <h2 className={layoutStyles.sidebarTitle}>강의 만족도 조사</h2>
          </div>

          <ul className={layoutStyles.sidebarMenu}>
            {SidebarMenus.map((menu) => {
              const isActive = pathname === menu.href;

              return (
                <li
                  key={menu.text}
                  className={`${layoutStyles.menuItem} ${
                    isActive ? layoutStyles.active : ""
                  }`}
                >
                  <a href={menu.href} className={layoutStyles.menuLink}>
                    <div className={layoutStyles.menuIcon}>
                      <span className={layoutStyles.menuIconDot}></span>
                    </div>
                    {menu.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={layoutStyles.sidebarFooter}>
          <SideBarFooter />
        </div>
      </nav>

      {/* 2. 오른쪽: 강의 평가 리스트 */}
      <main className={styles.evalMain}>
        <h1 className={styles.evalTitle}>강의 만족도 조사</h1>
        <p className={styles.evalPeriod}>
          기간 : 2025년 11월 23일 ~ 2025년 11월 30일
        </p>
        <p className={styles.evalNotice}>
          ※ 수업에 참여한 후 솔직하게 느낀 점을 작성해주세요.
        </p>

        {loading && <p className={styles.infoText}>불러오는 중...</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {message && <p className={styles.successText}>{message}</p>}

        {!loading && courses.length === 0 && !error && (
          <p className={styles.infoText}>
            현재 평가 가능한 강의가 없습니다.
          </p>
        )}

        {courses.length > 0 && (
          <table className={styles.evalTable}>
            <thead>
              <tr>
                <th className={styles.colCategory}>강의명</th>
                <th className={styles.colTeacher}>강사</th>
                <th className={styles.colAction}>강의평가</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const teacherName =
                  course.instructor_name ||
                  course.teacher_name ||
                  course.teacher ||
                  "-";

                return (
                  <tr key={course.id}>
                    {/* 강의명 */}
                    <td
                      className={`${styles.cellTitle} ${styles.colCategory}`}
                    >
                      {course.title}
                    </td>

                    {/* 강사 */}
                    <td
                      className={`${styles.cellTeacher} ${styles.colTeacher}`}
                    >
                      {teacherName}
                    </td>

                    {/* 평가하기 버튼 */}
                    <td
                      className={`${styles.cellAction} ${styles.colAction}`}
                    >
                      <button
                        type="button"
                        className={styles.evalButton}
                        onClick={() => openModal(course)}
                      >
                        평가하기
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 평가 모달 */}
        <EvalModal
          visible={!!openedCourse}
          course={openedCourse}
          questions={questions}
          onClose={closeModal}
          onSubmit={handleSubmitEvaluation}
          submitting={submitting}
        />
      </main>
    </div>
    {showLogoutModal && (
      <div className={styles.modalOverlay} onClick={handleCancelLogout}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div>
              <p className={styles.modalTitle}>로그아웃</p>
              <p className={styles.modalDesc}>정말 로그아웃 하시겠습니까?</p>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={handleCancelLogout}>취소</button>
              <button className={styles.confirmBtn} onClick={handleConfirmLogout}>확인</button>
            </div>
          </div>
      </div>
    )}
   </>    
  );
}
