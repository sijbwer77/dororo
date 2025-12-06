// app/admin/components/AdminEvalSummary.js
"use client";

import styles from "../admin.module.css";

export default function AdminEvalSummary({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className={styles.evalBox}>
      <h3 className={styles.evalTitle}>강의 만족도 상위 강의</h3>

      {/* 색깔 범례 (만족/보통/불만족) → 원하는 대로 수정 가능 */}
      <div className={styles.evalLegend}>
        <div className={styles.evalLegendItem}>
          <span
            className={styles.evalLegendColor}
            style={{ background: "#FF71A5" }}
          ></span>
          <span>만족 38%</span>
        </div>
        <div className={styles.evalLegendItem}>
          <span
            className={styles.evalLegendColor}
            style={{ background: "#BC69FF" }}
          ></span>
          <span>보통 17%</span>
        </div>
        <div className={styles.evalLegendItem}>
          <span
            className={styles.evalLegendColor}
            style={{ background: "#FECD66" }}
          ></span>
          <span>불만족 3%</span>
        </div>
      </div>

      {/* 헤더 */}
      <div className={styles.evalListHeader}>
        <div className={styles.evalHeaderCell}>순위</div>
        <div className={styles.evalHeaderCell}>강의명</div>
        <div className={styles.evalHeaderCell}>강사</div>
        <div className={styles.evalHeaderCell}>평균점수</div>
      </div>

      {/* 리스트 */}
      {data.map((item) => (
        <div key={item.rank} className={styles.evalRow}>
          <div className={styles.evalRank}>{item.rank}</div>
          <div className={styles.evalCourseTitle}>{item.title}</div>
          <div className={styles.evalTeacher}>{item.teacher}</div>
          <div className={styles.evalScore}>
            {item.avgScore}점 · {item.participants}명
          </div>
        </div>
      ))}
    </div>
  );
}
