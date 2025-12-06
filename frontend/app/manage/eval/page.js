// app/admin/eval/page.js
"use client";

import { useEffect, useState } from "react";
import styles from "./eval.module.css";
import { useRouter } from "next/navigation";
import {
  getTeacherEvalSummary,
  getTeacherEvalCourseDetail,
} from "@/lib/eval";

const MAX_SCORE = 5;

export default function AdminEvalPage() {
  const router = useRouter();

  // ---- 요약 데이터 (상단 카드 + 그래프 + 표) ----
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // ---- 선택된 강의 인덱스 ----
  const [currentIndex, setCurrentIndex] = useState(0);

  // ---- 선택된 강의 상세 (질문별 평균 + 코멘트) ----
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // ====================== 1. 요약 데이터 불러오기 ======================
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const data = await getTeacherEvalSummary();
        setSummary(data || null);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setSummaryError(
          err?.detail || "강의 평가 요약 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setSummaryLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const courses = summary?.courses || [];
  const hasCourses = courses.length > 0;
  const currentData = hasCourses ? courses[currentIndex] : null;

  // ====================== 2. 선택된 강의 상세 불러오기 ======================
  useEffect(() => {
    if (!currentData) {
      setDetail(null);
      return;
    }

    async function fetchDetail() {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const data = await getTeacherEvalCourseDetail(currentData.id);
        setDetail(data || null);
      } catch (err) {
        console.error(err);
        setDetailError(
          err?.detail ||
            "선택한 강의의 상세 평가 정보를 불러오는 중 오류가 발생했습니다."
        );
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    }

    fetchDetail();
  }, [currentData]);

  // ====================== 네비게이션 핸들러 ======================
  const handlePrev = () => {
    if (!hasCourses) return;
    setCurrentIndex((prev) => (prev === 0 ? courses.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!hasCourses) return;
    setCurrentIndex((prev) =>
      prev === courses.length - 1 ? 0 : prev + 1
    );
  };

  // 상세 페이지로 이동 (강의 ID 사용!)
  const handleMoreClick = () => {
    if (!currentData) return;
    router.push(`/admin/eval/${currentData.id}`);
  };

  // ====================== 상단 통계 카드 값 ======================
  const totalCourses = summary?.total_courses ?? 0;
  const completedRatio =
    summary?.completed_ratio != null
      ? `${Math.round(summary.completed_ratio * 100)}%`
      : "-";
  const averageScore =
    summary?.average_score != null
      ? summary.average_score.toFixed(1)
      : "-";

  const STAT_CARDS = [
    { label: "총 강의 수", value: String(totalCourses) },
    { label: "평가 완료 비율", value: completedRatio },
    { label: "평균 만족도", value: averageScore },
  ];

  return (
    <div className={styles.evalPage}>
      {/* ================= 왼쪽 기둥 (메인 영역) ================= */}
      <div className={styles.mainColumn}>
        {/* 0. 에러 메시지 */}
        {summaryError && (
          <p className={styles.errorText}>{summaryError}</p>
        )}

        {/* 1. 상단 통계 카드 3개 */}
        <section className={styles.statRow}>
          {STAT_CARDS.map((card) => (
            <div key={card.label} className={styles.statCard}>
              <div className={styles.statLabel}>{card.label}</div>
              <div className={styles.statValue}>
                {summaryLoading ? "…" : card.value}
              </div>
            </div>
          ))}
        </section>

        {/* 2. 그래프 영역 */}
        <section className={styles.chartSection}>
          <h3 className={styles.chartTitle}>
            강의별 평균 점수 (TOP 5)
          </h3>

          {summaryLoading && (
            <p className={styles.infoText}>데이터를 불러오는 중입니다…</p>
          )}

          {!summaryLoading && !hasCourses && (
            <p className={styles.infoText}>
              아직 평가 데이터가 있는 강의가 없습니다.
            </p>
          )}

          {hasCourses && (
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
                      />
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
          )}
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
              {hasCourses ? (
                courses.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      backgroundColor:
                        idx === currentIndex ? "#f0f7ff" : "transparent",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <td>{c.name}</td>
                    <td>{c.teacher}</td>
                    <td>{c.avg.toFixed(1)}</td>
                    <td>{c.max.toFixed(1)}</td>
                    <td>{c.min.toFixed(1)}</td>
                    <td>{c.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.infoText}>
                    평가 대상 강의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* ================= 오른쪽 기둥 (사이드바) ================= */}
      <aside className={styles.sideColumn}>
        <div className={styles.detailCard}>
          <div className={styles.detailHeaderBg} />

          <h2 className={styles.detailTitle}>
            {currentData ? currentData.name : "강의 없음"}
          </h2>
          <div className={styles.detailSub}>
            {currentData?.code || ""}
          </div>

          <div className={styles.detailMetaRow}>
            <span className={styles.detailMetaLabel}>강사명</span>
            <span className={styles.detailMetaValue}>
              {currentData?.teacher || "-"}
            </span>
          </div>

          <div className={styles.detailNav}>
            <button
              onClick={handlePrev}
              className={styles.navButton}
              disabled={!hasCourses}
            >
              &lt;
            </button>
            <span className={styles.navDivider}>/</span>
            <button
              onClick={handleNext}
              className={styles.navButton}
              disabled={!hasCourses}
            >
              &gt;
            </button>
          </div>

          {/* ===== 질문 항목별 평균 점수 ===== */}
          <div className={styles.metricList}>
            {detailLoading && (
              <p className={styles.infoText}>
                질문별 평균 점수를 불러오는 중입니다…
              </p>
            )}

            {detailError && (
              <p className={styles.errorText}>{detailError}</p>
            )}

            {!detailLoading &&
              detail &&
              detail.surveys &&
              detail.surveys.length > 0 && (
                <>
                  {detail.surveys.map((item) => (
                    <MetricRow
                      key={item.id}
                      label={item.text}
                      value={item.avg_score}
                      ratio={item.avg_score / MAX_SCORE}
                    />
                  ))}
                </>
              )}

            {!detailLoading &&
              detail &&
              detail.surveys &&
              detail.surveys.length === 0 && (
                <p className={styles.infoText}>
                  아직 점수형 문항에 대한 평가가 없습니다.
                </p>
              )}
          </div>

          {/* ===== 학생 코멘트 ===== */}
          <div className={styles.commentBlock}>
            <div className={styles.commentTitle}>학생 코멘트</div>

            {detailLoading && (
              <p className={styles.infoText}>
                코멘트를 불러오는 중입니다…
              </p>
            )}

            {!detailLoading &&
              detail &&
              detail.comments &&
              detail.comments.length > 0 && (
                <>
                  {detail.comments.slice(0, 4).map((comment, i) => (
                    <p key={i}>“{comment}”</p>
                  ))}
                  {detail.comments.length > 4 && (
                    <p className={styles.commentHint}>
                      자세한 코멘트는 &quot;더보기&quot;에서 확인할 수
                      있습니다.
                    </p>
                  )}
                </>
              )}

            {!detailLoading &&
              detail &&
              (!detail.comments || detail.comments.length === 0) && (
                <p className={styles.infoText}>
                  등록된 코멘트가 없습니다.
                </p>
              )}

            <button
              onClick={handleMoreClick}
              className={styles.moreButton}
              disabled={!currentData}
            >
              더보기 &gt;
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function MetricRow({ label, value, ratio }) {
  const safeValue = typeof value === "number" ? value : 0;
  const width = (ratio ?? safeValue / MAX_SCORE) * 128;

  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricBarBg}>
        <div
          className={styles.metricBarFill}
          style={{ width: `${width}px`, transition: "width 0.3s" }}
        />
      </div>
      <span className={styles.metricValue}>
        {typeof value === "number" ? safeValue.toFixed(1) : "-"}
      </span>
    </div>
  );
}