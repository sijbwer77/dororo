'use client';

import styles from "./assignment.module.css"; // (1. 수정!) 'assignment.module.css'
import Image from "next/image";
import Link from "next/link"; 
import { useRouter, useParams} from 'next/navigation'; 
import Sidebar from "@/components/Sidebar.js";
import { FAKE_ASSIGNMENTS } from "@/data/mock-assignments.js"; 

export default function AssignmentPage() {
  const router = useRouter(); 
  const params = useParams(); 

  const handleBack = () => router.back();
  const handleHome = () => router.push('/student');
  
  const courseId = params.id;

  return (
    <div className={styles.pageLayout}>
      
      {/* 1. 왼쪽: 과목 전용 사이드바 (내용 동일, CSS 클래스만 변경) */}
      <Sidebar courseId={courseId} />

      {/* 2. 오른쪽: 메인 콘텐츠 (과제 목록) */}
      <main className={styles.mainContent}>
        
        {/* 'Rectangle 38' (파란색 헤더) */}
        <header className={styles.header}>
          <div className={styles.arrowIcon}>
            <Image src="/arrow-down.svg" alt="아래 화살표" width={38} height={38} />
          </div>
          <h1 className={styles.mainTitle}>과제</h1>
        </header>

        {/* 과제 목록 */}
        <div className={styles.assignmentList}>
          {/* (4. 추가!) 가짜 과제 데이터를 .map()으로 반복 */}
          {FAKE_ASSIGNMENTS.map((assignment) => (
            // (중요!) 과제 상세 페이지로 링크
            <Link 
              href={`/student/course/${courseId}/assignment/${assignment.id}`} 
              key={assignment.id} 
              className={`${styles.assignmentItem} ${assignment.isSubmitted ? styles.submitted : styles.notSubmitted}`}
            >
              <div className={styles.assignmentIcon}>
                <Image src="/assignment-icon.svg" alt="과제 아이콘" width={40} height={40} />
              </div>
              <div className={styles.assignmentDetails}>
                <span className={styles.assignmentTitle}>{assignment.title}</span>
                <span className={styles.assignmentDeadline}>마감: {assignment.deadline}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}