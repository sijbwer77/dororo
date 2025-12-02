// app/student/course/[id]/assignment/page.js

'use client';

import { useEffect, useState } from "react";
import styles from "./assignment.module.css";
import Image from "next/image";
import Link from "next/link"; 
import { useRouter, useParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar.js";

export default function AssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📌 백엔드에서 과제 목록 가져오기
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/student/course/${courseId}/assignments/`,
          {
            credentials: "include", // 세션 유지
          }
        );

        if (!res.ok) throw new Error("Failed to fetch assignments");

        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error("과제 목록 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  return (
    <div className={styles.pageLayout}>
      
      {/* 왼쪽 사이드바 */}
      <Sidebar courseId={courseId} />

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        
        {/* 파란색 헤더 */}
        <header className={styles.header}>
          <div className={styles.arrowIcon}>
            <Image src="/arrow-down.svg" alt="arrow" width={38} height={38} />
          </div>
          <h1 className={styles.mainTitle}>과제</h1>
        </header>

        {/* 로딩 */}
        {loading && (
          <p style={{ padding: "20px" }}>불러오는 중...</p>
        )}

        {/* 과제 없음 */}
        {!loading && assignments.length === 0 && (
          <p style={{ padding: "20px" }}>등록된 과제가 없습니다.</p>
        )}

        {/* 과제 목록 */}
        <div className={styles.assignmentList}>
          {assignments.map((assignment) => (
            <Link 
              href={`/student/course/${courseId}/assignment/${assignment.id}`} 
<<<<<<< HEAD
              key={assignment.id}
              className={styles.assignmentItem}
=======
              key={assignment.id} 
              className={`${styles.assignmentItem} ${assignment.isSubmitted ? styles.submitted : styles.notSubmitted}`}
>>>>>>> main
            >
              <div className={styles.assignmentIcon}>
                <Image src="/assignment-icon.svg" alt="과제" width={40} height={40} />
              </div>
              <div className={styles.assignmentDetails}>
                <span className={styles.assignmentTitle}>{assignment.title}</span>
                <span className={styles.assignmentDeadline}>
                  마감: {assignment.due_date?.slice(0, 16).replace("T", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
