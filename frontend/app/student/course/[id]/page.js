// app/student/course/[id]/page.js

'use client';

import styles from "./course.module.css";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar.js";
import { noticesByCourseId } from "@/data/mock-notices"; // ✅ 새로 추가

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id;

  // 해당 코스의 공지 목록 가져오기 (없으면 빈 배열)
  const notices = noticesByCourseId[courseId] || [];

  return (
    <div className={styles.pageLayout}>
      {/* 왼쪽 사이드바 */}
      <Sidebar courseId={courseId} />

      {/* 오른쪽 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        <h1 className={styles.mainTitle}>NOTICE</h1>
        <div className={styles.titleLine}></div>

        {/* 공지사항 목록 */}
        <div className={styles.noticeList}>
          {notices.length === 0 && (
            <div className={styles.noticeCard}>
              <h3>등록된 공지가 없습니다.</h3>
            </div>
          )}

          {notices.map((notice) => (
            <div key={notice.id} className={styles.noticeCard}>
              <h3>{notice.title}</h3>
              <span>작성일: {notice.date}</span>
              <p>{notice.preview}</p>

              {/* 마우스 올렸을 때 펼쳐지는 영역 (CSS로 컨트롤) */}
              <div className={styles.detailArea}>
                {notice.content}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
