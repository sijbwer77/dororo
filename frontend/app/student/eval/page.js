// app/student/eval/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Router 추가
import layoutStyles from "../dimc/dimc.module.css"; // DIMC 스타일 재사용 (모달 스타일 포함)
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
const SidebarMenus = [
  { text: "강의 평가", href: "/student/eval" },
];

const QUESTIONS = [
  "만족도 조사 내용1",
  "만족도 조사 내용2",
  "만족도 조사 내용3",
  "만족도 조사 내용4",
  "만족도 조사 내용5",
  "만족도 조사 내용6",
  "만족도 조사 내용7",
  "만족도 조사 내용8",
  "만족도 조사 내용9",
];

// 드래그 가능한 평가 모달 컴포넌트
function EvalModal({ visible, course, onClose }) {
  const [position, setPosition] = useState({ x: 520, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [answers, setAnswers] = useState(
    () => Array(QUESTIONS.length).fill(0)
  );

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

  const handleScoreChange = (idx, newValue) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = newValue;
      return copy;
    });
  };

  const handleSubmit = () => {
    console.log("제출할 점수: ", answers);
    onClose();
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

        <div className={styles.modalBody}>
          {QUESTIONS.map((q, idx) => (
            <div key={idx} className={styles.questionRow}>
              <div className={styles.questionText}>{q}</div>
              <ScoreCircles
                value={answers[idx]}
                onChange={(newValue) => handleScoreChange(idx, newValue)}
              />
            </div>
          ))}
        </div>

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
  const router = useRouter(); // ✅ 라우터

  const [openedCourse, setOpenedCourse] = useState(null);
  
  // ✅ 로그아웃 모달 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const openModal = (course) => setOpenedCourse(course);
  const closeModal = () => setOpenedCourse(null);

  // 로고 클릭 -> 로그아웃 모달 열기
  const handleLogoClick = () => setShowLogoutModal(true);

  // 로그아웃 확인
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/");
  };

  // 모달 닫기
  const handleCancelLogout = () => setShowLogoutModal(false);

  return (
    <>
      <div className={layoutStyles.pageLayout}>
        {/* 1. 왼쪽 사이드바 */}
        <nav className={layoutStyles.sidebar}>
          <div className={layoutStyles.sidebarTop}>
            {/* ✅ 로고 영역: 클릭 시 모달 오픈 */}
            <div 
              className={layoutStyles.sidebarLogo} 
              onClick={handleLogoClick}
              style={{ cursor: "pointer" }}
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
                <Image src="/Task.svg" alt="강의평가 아이콘" width={25} height={32} />
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

          <table className={styles.evalTable}>
            <thead>
              <tr>
                <th className={styles.colCategory}>강의명</th>
                <th className={styles.colTeacher}>강사</th>
                <th className={styles.colAction}>강의평가</th>
              </tr>
            </thead>
            <tbody>
              {FAKE_COURSES.map((course) => (
                <tr key={course.id}>
                  <td className={`${styles.cellTitle} ${styles.colCategory}`}>
                    <span className={styles.category}>{course.category}</span>
                    {course.title}
                  </td>
                  <td className={`${styles.cellTeacher} ${styles.colTeacher}`}>
                    {course.teacher}
                  </td>
                  <td className={`${styles.cellAction} ${styles.colAction}`}>
                    <button
                      type="button"
                      className={styles.evalButton}
                      onClick={() => openModal(course)}
                    >
                      평가하기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 강의 평가 드래그 모달 */}
          <EvalModal
            visible={!!openedCourse}
            course={openedCourse}
            onClose={closeModal}
          />
        </main>
      </div>

      {/* ✅ 로그아웃 모달창 (layoutStyles 사용 - dimc.module.css에 정의됨) */}
      {showLogoutModal && (
        <div className={layoutStyles.modalOverlay} onClick={handleCancelLogout}>
           <div className={layoutStyles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div>
                <p className={layoutStyles.modalTitle}>로그아웃</p>
                <p className={layoutStyles.modalDesc}>정말 로그아웃 하시겠습니까?</p>
              </div>
              <div className={layoutStyles.modalButtons}>
                <button className={layoutStyles.cancelBtn} onClick={handleCancelLogout}>취소</button>
                <button className={layoutStyles.confirmBtn} onClick={handleConfirmLogout}>확인</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}