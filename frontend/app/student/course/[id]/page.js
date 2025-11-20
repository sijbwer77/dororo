// app/student/course/[id]/page.js

'use client'; 

import styles from "./course.module.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from 'next/navigation'; 
import { FAKE_COURSES } from "../../../../data/mock-courses.js"; 
import SideBarFooter from "../../../../components/SideBarFooter.js";

const FAKE_NOTICES = [
  { id: 1, title: "중간고사 일정 안내", date: "2025-04-02", content: "2025학년도 1학기 중간고사가 다음과 같이 진행됩니다..." },
  { id: 2, title: "과제 제출 기한 연장 안내", date: "2025-03-28", content: "네트워크 프로그래밍과 과제 2 제출 기한 연장 안내입니다..." },
  { id: 3, title: "퀴즈 안내", date: "2025-03-21", content: "1차 퀴즈 범위 및 날짜 안내드립니다..." }
];

const courseSidebarMenus = [
  { text: "공지", active: true }, 
  { text: "주차학습" },
  { text: "과제" },
  { text: "팀" },
  { text: "메시지" },
];

export default function CourseDetailPage() {
  const router = useRouter(); 
  const params = useParams(); 

  const handleBack = () => router.back();
  const handleHome = () => router.push('/student');

  const courseId = params.id;
  const course = FAKE_COURSES.find(c => c.id == courseId);
  const courseName = course ? course.title : "과목 상세"; 

  return (
    // 'Desktop - 247' (전체 페이지 레이아웃)
    <div className={styles.pageLayout}>
      
      {/* 1. 왼쪽: 과목 전용 사이드바 */}
      <nav className={styles.sidebar}>
        
        {/* --- 사이드바 상단 --- */}
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <Image src="/doro-logo.svg" alt="DORO 로고" width={147} height={38}/>
          </div>
          <div className={styles.profileIcon}>
            <Image src="/profile-circle.svg" alt="프로필 아이콘" width={184} height={184}/> 
          </div>
        </div>

        {/* (수정!) '과목명' + '아이콘'을 div로 감쌌습니다 */}
        <div className={styles.courseTitleContainer}>
          <div className={styles.courseTitleIcon}>
            <Image 
              src="/book-open.svg" 
              alt="과목 아이콘" 
              width={29} 
              height={26}
            />
          </div>
          <h2 className={styles.courseTitle}>{courseName}</h2>
        </div>

        {/* --- 과목 메뉴 (점) --- */}
        <ul className={styles.sidebarMenu}>
          {courseSidebarMenus.map((menu) => (
            <li
              key={menu.text}
              className={`${styles.menuItem} ${menu.active ? styles.active : ""}`}
            >
              <div className={styles.menuIcon}>
                <span className={styles.menuIconDot}></span>
              </div>
              {menu.text}
            </li>
          ))}
        </ul>

        {/* --- 사이드바 푸터 (컴포넌트) --- */}
        <SideBarFooter /> 
      </nav>

      {/* 2. 오른쪽: 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        <h1 className={styles.mainTitle}>NOTICE</h1>
        <div className={styles.titleLine}></div>

        {/* 공지사항 목록 */}
        <div className={styles.noticeList}>
          {FAKE_NOTICES.map((notice) => (
            <div key={notice.id} className={styles.noticeCard}>
              <h3>{notice.title}</h3>
              <span>작성일: {notice.date}</span>
              <p>{notice.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}