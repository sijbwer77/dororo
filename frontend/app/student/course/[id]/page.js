// app/student/course/[id]/page.js

'use client'; 

import styles from "./course.module.css";
import Image from "next/image";
import Link from "next/link";
import {useParams } from 'next/navigation'; 
import Sidebar from "@/components/Sidebar.js";

const FAKE_NOTICES = [
  { id: 1, title: "중간고사 일정 안내", date: "2025-04-02", content: "2025학년도 1학기 중간고사가 다음과 같이 진행됩니다..." },
  { id: 2, title: "과제 제출 기한 연장 안내", date: "2025-03-28", content: "네트워크 프로그래밍과 과제 2 제출 기한 연장 안내입니다..." },
  { id: 3, title: "퀴즈 안내", date: "2025-03-21", content: "1차 퀴즈 범위 및 날짜 안내드립니다..." }
];

export default function CourseDetailPage() {
  //const router = useRouter(); 필요시 해제
  const params = useParams(); 
  const courseId = params.id;

  const courseSidebarMenus = [
    { text: "공지", href: `/student/course/${courseId}` }, 
    { text: "주차학습", href: `/student/course/${courseId}/learning`},
    { text: "과제", href: `/student/course/${courseId}/assignment` },
    { text: "팀", href: `/student/course/${courseId}/team`},
    { text: "메시지", href: "#" },
  ];


  return (
    <div className={styles.pageLayout}>
      
      <Sidebar courseId={courseId} />

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