// app/student/eval/page.js
"use client";

import { useState, useEffect } from "react";
import layoutStyles from "../dimc/dimc.module.css"; // DIMC / 결과 페이지랑 같은 사이드바 레이아웃
import styles from "./eval.module.css";
import Image from "next/image";
import SideBarFooter from "@/components/SideBarFooter";
import { usePathname } from "next/navigation";
import ScoreCircles from "@/components/ScoreCircles";

import {
  getMyEvalCourses,
  getEvalQuestions,
  submitEvaluation,
} from "@/lib/eval";

// 사이드바 메뉴
const SidebarMenus = [{ text: "강의 평가", href: "/student/eval" }];

// 드래그 가능한 평가 모달 컴포넌트
function EvalModal({ visible, course, questions, onClose, onSubmitted }) {
  const [position, setPosition] = useState({ x: 520, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 점수형 문항 점수
  const [scores, setScores] = useState([]);
  // 서술형 문항 텍스트
  const [texts, setTexts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열릴 때마다 질문 개수에 맞춰 초기화
  useEffect(() => {
    if (visible && questions && questions.length > 0) {
      setScores(Array(questions.length).fill(0));
      setTexts(Array(questions.length).fill(""));
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

  // idx 번째 질문의 점수 변경
  const handleScoreChange = (idx, newValue) => {
    setScores((prev) => {
      const copy = [...prev];
      copy[idx] = newValue;
      return copy;
    });
  };

  // idx 번째 질문의 서술형 답변 변경
  const handleTextChange = (idx, value) => {
    setTexts((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!questions || questions.length === 0) {
      alert("설문 문항을 불러오지 못했습니다.");
      return;
    }

    // 점수형 문항은 1~5 중 반드시 선택
    const hasMissingScore = questions.some(
      (q, idx) => !q.is_text && (!scores[idx] || scores[idx] < 1)
    );
    if (hasMissingScore) {
      alert("모든 문항의 점수를 선택해주세요.");
      return;
    }

    const payloadAnswers = questions.map((q, idx) => {
      if (q.is_text) {
        return {
          question: q.id,
          text: texts[idx] || "",
        };
      }
      return {
        question: q.id,
        score: scores[idx],
      };
    });

    try {
      setSubmitting(true);

      await submitEvaluation(course.id, payloadAnswers);

      alert("강의 평가가 정상적으로 제출되었습니다.");
      if (onSubmitted) onSubmitted(course);
      onClose();
    } catch (err) {
      console.error(err);
      alert(
        err.detail ||
          "강의 평가 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const teacherName =
    course.instructor_name ||
    course.instructor ||
    course.teacher ||
    course.teacher_name ||
    "-";

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
            <div className={styles.modalTeacher}>강사: {teacherName}</div>
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
            <div key={q.id ?? idx} className={styles.questionRow}>
              <div className={styles.questionText}>{q.text}</div>

              {/* 점수형 문항 */}
              {!q.is_text && (
                <ScoreCircles
                  value={scores[idx]}
                  onChange={(newValue) => handleScoreChange(idx, newValue)}
                />
              )}

              {/* 서술형 문항 */}
              {q.is_text && (
                <textarea
                  className={styles.textAnswer}
                  value={texts[idx]}
                  onChange={(e) => handleTextChange(idx, e.target.value)}
                  placeholder="의견을 자유롭게 작성해주세요."
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

export default function LectureEvalPage() {
  const pathname = usePathname();
  const [openedCourse, setOpenedCourse] = useState(null);

  // 실제 API에서 가져온 데이터들
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const openModal = (course) => {
    setOpenedCourse(course);
  };

  const closeModal = () => {
    setOpenedCourse(null);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [courseData, questionData] = await Promise.all([
          getMyEvalCourses(),
          getEvalQuestions(),
        ]);

        setCourses(courseData || []);
        setQuestions(questionData || []);
      } catch (err) {
        console.error(err);
        setError(err.detail || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={layoutStyles.pageLayout}>
      {/* 1. 왼쪽 사이드바 */}
      <nav className={layoutStyles.sidebar}>
        <div className={layoutStyles.sidebarTop}>
          <div className={layoutStyles.sidebarLogo}>
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

        {loading && <p>강의 및 설문 문항을 불러오는 중입니다...</p>}
        {error && !loading && (
          <p className={styles.errorText}>{error}</p>
        )}

        {!loading && !error && (
          <table className={styles.evalTable}>
            <thead>
              <tr>
                <th className={styles.colCategory}>강의명</th>
                <th className={styles.colTeacher}>강사</th>
                <th className={styles.colAction}>강의평가</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={3} className={styles.emptyRow}>
                    수강 중인 강의가 없습니다.
                  </td>
                </tr>
              )}

              {courses.map((course) => {
                const category = course.course_type || course.category || "";
                const teacherName =
                  course.instructor_name ||
                  course.instructor ||
                  course.teacher ||
                  course.teacher_name ||
                  "-";

                return (
                  <tr key={course.id}>
                    {/* 강의명 */}
                    <td
                      className={`${styles.cellTitle} ${styles.colCategory}`}
                    >
                      {category && (
                        <span className={styles.category}>{category}</span>
                      )}
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
          onSubmitted={(course) => {
            console.log("평가 완료:", course);
          }}
        />
      </main>
    </div>
  );
}
