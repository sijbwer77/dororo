// app/admin/eval/page.js
"use client";

import { useEffect, useState } from "react";
import styles from "./eval.module.css";
import { useRouter } from "next/navigation";
import { getTeacherEvalSummary } from "@/lib/eval";

const MAX_SCORE = 5;

export default function AdminEvalPage() {
  const router = useRouter();

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total_courses: 0,
    completed_ratio: null,
    average_score: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const currentData = courses[currentIndex] || null;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(courses.length - 1, 0) : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === courses.length - 1 ? 0 : prev + 1
    );
  };

  // 상세 페이지 이동: 이제 index 말고 course.id 사용
  const handleMoreClick = () => {
    if (!currentData) return;
    router.push(`/admin/eval/${currentData.id}`);
  };

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);

        const data = await getTeacherEvalSummary();

        setStats({
          total_courses: data.total_courses ?? 0,
          completed_ratio: data.completed_ratio,
          average_score: data.average_score,
        });
        setCourses(data.courses || []);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setError(err.detail || "통계 데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const STAT_CARDS = [
    { label: "총 강의 수", value: String(stats.total_courses ?? 0) },
    {
      label: "평가 완료 비율",
      value:
        stats.completed_ratio == null
          ? "-"
          : `${Math.round(stats.completed_ratio * 100)}%`,
    },
    {
      label: "평균 만족도",
      value:
        stats.average_score == null
          ? "-"
          : stats.average_score.toFixed(1),
    },
  ];

  return (
    <div className={styles.evalPage}>
      <div className={styles.mainColumn}>
        {loading && <p className={styles.loadingText}>데이터를 불러오는 중입니다...</p>}
        {error && !loading && (
          <p className={styles.errorText}>{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* 1. 상단 통계 카드 3개 */}
            <section className={styles.statRow}>
              {STAT_CARDS.map((card) => (
                <div key={card.label} className={styles.statCard}>
                  <div className={styles.statLabel}>{card.label}</div>
                  <div className={styles.statValue}>{card.value}</div>
                </div>
              ))}
            </section>

            {/* 2. 그래프 영역 */}
            <section className={styles.chartSection}>
              <h3 className={styles.chartTitle}>강의별 평균 점수</h3>
              <div className={styles.chartArea}>
                <div className={styles.yAxis}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <div key={n} className={styles.yAxisRow}>
                      <span className={styles.yAxisLabel}>{n}</span>
                      <span className={styles.yAxisLine} />
                    </div>
                  ))}
                </div>
                <div className={styles.barArea}>
                  {courses.map((c, idx) => (
                    <div key={c.id} className={styles.barItem}>
                      <div className={styles.barWrapper}>
                        <div
                          className={styles.bar}
                          style={{
                            height: `${(c.avg / MAX_SCORE) * 196}px`,
                            opacity: idx === currentIndex ? 1 : 0.4,
                            transition: "opacity 0.3s",
                          }}
                        ></div>
                      </div>
                      <div
                        className={styles.barLabel}
                        style={{
                          fontWeight:
                            idx === currentIndex ? "bold" : "normal",
                        }}
                      >
                        {c.short_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. 표 영역 */}
            <section className={styles.tableSection}>
              <div className={styles.tableDecorationTop} />
              <table className={styles.evalTable}>
                <thead>
                  <tr>
                    <th>강의명</th>
                    <th>강사명</th>
                    <th>평균 점수</th>
                    <th>최고점</th>
                    <th>최하점</th>
                    <th>응답 수</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "24px 0" }}>
                        평가 데이터가 아직 없습니다.
                      </td>
                    </tr>
                  )}

                  {courses.map((c, idx) => (
                    <tr
                      key={c.id}
                      style={{
                        backgroundColor:
                          idx === currentIndex ? "#f0f7ff" : "transparent",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <td>{c.name}</td>
                      <td>{c.teacher}</td>
                      <td>{c.avg.toFixed(1)}</td>
                      <td>{c.max}</td>
                      <td>{c.min}</td>
                      <td>{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>

      {/* 오른쪽 상세 카드 */}
      <aside className={styles.sideColumn}>
        {currentData && (
          <div className={styles.detailCard}>
            <div className={styles.detailHeaderBg} />

            <h2 className={styles.detailTitle}>{currentData.name}</h2>
            <div className={styles.detailSub}>{currentData.code}</div>

            <div className={styles.detailMetaRow}>
              <span className={styles.detailMetaLabel}>강사명</span>
              <span className={styles.detailMetaValue}>
                {currentData.teacher}
              </span>
            </div>

            <div className={styles.detailNav}>
              <button onClick={handlePrev} className={styles.navButton}>
                &lt;
              </button>
              <span className={styles.navDivider}>/</span>
              <button onClick={handleNext} className={styles.navButton}>
                &gt;
              </button>
            </div>

            <div className={styles.metricList}>
              <MetricRow
                label="평균 점수"
                value={currentData.avg}
                ratio={currentData.avg / 5}
              />
              <MetricRow
                label="최고점"
                value={currentData.max}
                ratio={currentData.max / 5}
              />
              <MetricRow
                label="최하점"
                value={currentData.min}
                ratio={currentData.min / 5}
              />
            </div>

            <div className={styles.commentBlock}>
              <div className={styles.commentTitle}>학생 코멘트</div>
              <p style={{ color: "#999", marginTop: "12px" }}>
                자세한 코멘트는 &quot;더보기&quot;에서 확인할 수 있습니다.
              </p>
              <button
                onClick={handleMoreClick}
                className={styles.moreButton}
              >
                더보기 &gt;
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function MetricRow({ label, value, ratio }) {
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricBarBg}>
        <div
          className={styles.metricBarFill}
          style={{ width: `${ratio * 128}px`, transition: "width 0.3s" }}
        />
      </div>
      <span className={styles.metricValue}>
        {typeof value === "number" ? value.toFixed(1) : "-"}
      </span>
    </div>
  );
}
