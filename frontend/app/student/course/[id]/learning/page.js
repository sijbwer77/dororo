'use client'; // (1. 'use client' 확인)

import styles from "./learning.module.css"; 
import Image from "next/image";
import Link from "next/link"; 
import { useRouter, useParams } from 'next/navigation'; 
import Sidebar from "@/components/Sidebar.js";
import { FAKE_LEARNING_PROGRESS, FAKE_WEEKS_DATA } from "@/data/mock-learning.js"; // (절대 경로)

export default function LearningPage() {
  const router = useRouter(); // (참고) SideBarFooter가 사용
  const params = useParams(); 
  
  const courseId = params.id;

  return (
    <div className={styles.pageLayout}>
      
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        <div className={styles.progressContainer}>
          {FAKE_LEARNING_PROGRESS.map((progress) => (
            <div 
              key={progress.week}
              className={`${styles.progressCircle} ${styles[progress.status]}`}
            >
              {progress.week}
            </div>
          ))}
        </div>
        <div className={styles.progressLine}></div>
        <div className={styles.weekList}>
          {FAKE_WEEKS_DATA.map((week) => (
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
                          src="/file-icon.svg" // (필수!) 1단계에서 저장한 파일명
                          alt="PDF 아이콘"
                          width={22} // (필수!) 피그마 CSS 너비
                          height={22} // (필수!) 피그마 CSS 높이
                        />
                      </div>
                      <a 
                        href={material.url} // ⬅️ (1) data/mock-learning.js의 URL
                        target="_blank"      // ⬅️ (2) 새 탭에서 열기
                        rel="noopener noreferrer" // ⬅️ (3) 보안 설정
                        className={styles.materialTitle}
                      >
                        {material.title} {/* ⬅️ (4) "자료 1 (샘플 PDF)" */}
                      </a>
                      
                      {/* 다운로드 아이콘에도 링크 적용 */}
                      <a href={material.url} download className={styles.downloadIcon}>
                        
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