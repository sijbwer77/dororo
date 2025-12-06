// app/admin/eval/[id]/page.js
"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./detail.module.css";
import { getTeacherEvalCourseDetail } from "@/lib/eval";

export default function AdminEvalDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const id = params.id; // 강의 ID

  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await getTeacherEvalCourseDetail(id);
        setDetail(data);
      } catch (err) {
        console.error(err);
        setError(
          err.detail || "강의 평가 상세 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loadingText}>데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            &lt;
          </button>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.courseTitle}>강의 평가 상세</h1>
          </div>
        </header>
        <p className={styles.errorText}>{error || "데이터가 없습니다."}</p>
      </div>
    );
  }

  const COURSE_DETAIL = detail;

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.pageHeader}>
        <button
          onClick={() => router.back()}
          className={styles.backButton}
        >
          &lt;
        </button>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.courseTitle}>{COURSE_DETAIL.name}</h1>
          <span className={styles.courseInfo}>{COURSE_DETAIL.info}</span>
        </div>
      </header>

      {/* 본문 */}
      <div className={styles.contentBody}>
        {/* 왼쪽: 질문별 평균 점수 */}
        <section className={styles.leftSection}>
          {COURSE_DETAIL.surveys.map((item, index) => (
            <div key={index} className={styles.surveyRow}>
              <div className={styles.surveyLabel}>{item.text}</div>
              <div className={styles.barContainer}>
                <div className={styles.barBackground}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${(item.avg_score / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className={styles.scoreValue}>
                {item.avg_score.toFixed(1)}
              </div>
            </div>
          ))}

          {COURSE_DETAIL.surveys.length === 0 && (
            <p className={styles.emptyText}>
              아직 점수형 문항에 대한 평가가 없습니다.
            </p>
          )}
        </section>

        {/* 오른쪽: 학생 코멘트 */}
        <section className={styles.rightSection}>
          <h2 className={styles.commentHeader}>학생 코멘트</h2>

          <div className={styles.commentList}>
            {COURSE_DETAIL.comments && COURSE_DETAIL.comments.length > 0 ? (
              COURSE_DETAIL.comments.map((comment, index) => (
                <div key={index} className={styles.commentItem}>
                  <p>“{comment}”</p>
                </div>
              ))
            ) : (
              <p
                style={{
                  color: "#999",
                  marginTop: "20px",
                }}
              >
                등록된 코멘트가 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
