// app/student/eval/page.js
"use client";

import { useState } from "react";
import layoutStyles from "../dimc/dimc.module.css"; // DIMC / 결과 페이지랑 같은 사이드바 레이아웃
import styles from "./eval.module.css";
import Image from "next/image";
import SideBarFooter from "@/components/SideBarFooter";
import { usePathname } from "next/navigation";
import { FAKE_COURSES } from "@/data/mock-courses";
import ScoreCircles from "@/components/ScoreCircles";

// 사이드바 메뉴
const SidebarMenus = [
  { text: "강의 평가", href: "/student/eval" },
];

// 설문 문항 더미 (나중에 API에서 가져와도 됨)
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

  // 🔥 질문별 점수: [0,0,0,0,0,0,0,0,0] 이런 식으로 저장
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

  // ✅ idx 번째 질문의 점수 변경
  const handleScoreChange = (idx, newValue) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = newValue;
      return copy;
    });
  };

  const handleSubmit = () => {
    // TODO: answers 를 API 로 보내기
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
        {/* 헤더(드래그 영역) */}
        <div className={styles.modalHeader} onMouseDown={handleMouseDown}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalCourseTitle}>{course.title}</div>
            <div className={styles.modalTeacher}>강사: {course.teacher}</div>
          </div>

          <div className={styles.modalHeaderRight}>
            {/* 이건 단순 “5 4 3 2 1” 안내용 숫자/동그라미면 그냥 두고,
                실제 선택은 아래 ScoreCircles로 함 */}
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
            >
              ✕
            </button>
          </div>
        </div>

        {/* 설문 내용 */}
        <div className={styles.modalBody}>
          {QUESTIONS.map((q, idx) => (
            <div key={idx} className={styles.questionRow}>
              <div className={styles.questionText}>{q}</div>

              {/* ✅ 각 문항마다 자기 점수만 사용 */}
              <ScoreCircles
                value={answers[idx]}                      // 이 문항의 점수
                onChange={(newValue) => handleScoreChange(idx, newValue)}
              />
            </div>
          ))}
        </div>

        {/* 완료 버튼 */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LectureEvalPage() {
  const pathname = usePathname();
  const [openedCourse, setOpenedCourse] = useState(null);

  const openModal = (course) => {
    setOpenedCourse(course);
  };

  const closeModal = () => {
    setOpenedCourse(null);
  };

  return (
    <div className={layoutStyles.pageLayout}>
      {/* 1. 왼쪽 사이드바 (DIMC랑 동일 구조) */}
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
                {/* 강의명 */}
                <td className={`${styles.cellTitle} ${styles.colCategory}`}>
                  <span className={styles.category}>{course.category}</span>
                  {course.title}
                </td>

                {/* 강사 */}
                <td className={`${styles.cellTeacher} ${styles.colTeacher}`}>
                  {course.teacher}
                </td>

                {/* 평가하기 버튼 */}
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

        {/* 평가 모달 */}
        <EvalModal
          visible={!!openedCourse}
          course={openedCourse}
          onClose={closeModal}
        />
      </main>
    </div>
  );
}
