// app/student/course/[id]/page.js

'use client';

import { useEffect, useState } from "react";
import styles from "./course.module.css";
import Image from "next/image";
import Link from "next/link";
import { useParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar.js";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 공지사항 불러오기
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/student/course/${courseId}/notices/`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch notices");
        }

        const data = await res.json();
        setNotices(data);
      } catch (err) {
        console.error("공지 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [courseId]);

  return (
    <div className={styles.pageLayout}>
      
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        <h1 className={styles.mainTitle}>NOTICE</h1>
        <div className={styles.titleLine}></div>

        {/* 로딩 화면 */}
        {loading && (
          <p style={{ padding: "20px", fontSize: "18px" }}>불러오는 중...</p>
        )}

        {/* 공지 없음 */}
        {!loading && notices.length === 0 && (
          <p style={{ padding: "20px", fontSize: "18px" }}>등록된 공지가 없습니다.</p>
        )}

        {/* 공지 목록 */}
        <div className={styles.noticeList}>
          {notices.map((notice) => (
            <div key={notice.id} className={styles.noticeCard}>
              <h3>{notice.title}</h3>
              <span>작성일: {notice.created_at?.slice(0, 10)}</span>
              <p>{notice.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
