'use client';

import { useEffect, useState } from "react";
import styles from "./learning.module.css"; 
import Image from "next/image";
import { useParams /*, useRouter*/ } from 'next/navigation'; 
import Sidebar from "@/components/Sidebar.js";

export default function LearningPage() {
  // const router = useRouter(); // (참고) SideBarFooter가 사용 → 이 컴포넌트에선 안 쓰면 지워도 됨
  const params = useParams();
  const courseId = params.id;

  const [weeks, setWeeks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/student/courses/${courseId}/lessons/`,
          {
            credentials: "include", // 로그인 세션 쿠키 쓰는 경우
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch learning data");
        }

        const data = await res.json();
        setWeeks(data.weeks || []);
        setProgress(data.progress || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return <div>로딩중...</div>;
  }

  return (
    <div className={styles.pageLayout}>
      
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        <div className={styles.progressContainer}>
          {progress.map((progressItem) => (
            <div 
              key={progressItem.week}
              className={`${styles.progressCircle} ${styles[progressItem.status]}`}
            >
              {progressItem.week}
            </div>
          ))}
        </div>

        <div className={styles.progressLine}></div>

        <div className={styles.weekList}>
          {weeks.map((week) => (
            <div key={week.id} className={styles.weekBlock}>
              <div className={styles.weekHeader}>
                {week.title}
              </div>
              
              <div className={styles.materialList}>
                {week.materials.length > 0 ? (
                  week.materials.map((material) => (
                    <div key={material.id} className={styles.materialItem}>
                      <div className={styles.pdfIcon}>
                        <Image
                          src="/file-icon.svg"
                          alt="PDF 아이콘"
                          width={22}
                          height={22}
                        />
                      </div>
                      <a 
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.materialTitle}
                      >
                        {material.title}
                      </a>
                      
                      <a
                        href={material.url}
                        download
                        className={styles.downloadIcon}
                      >
                        {/* 다운로드 아이콘 SVG 있으면 여기 */}
                      </a>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyMessage}>업로드된 자료가 없습니다.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
