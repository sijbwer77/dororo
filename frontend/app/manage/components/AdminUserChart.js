// app/admin/components/AdminUserChart.js
"use client";

import styles from "../admin.module.css";

export default function AdminUserChart({ data }) {
  if (!data || data.length === 0) return null;

  // 1) y축 최대값 (신규/탈퇴, 100 중 제일 큰 값)
  const maxValue = Math.max(
    100,
    ...data.map((d) => d.newUsers),
    ...data.map((d) => d.withdrawn)
  );

  // 2) 누적값(신규 - 탈퇴 누적)
  let cumulative = 0;
  const cumulativePoints = data.map((d) => {
    cumulative += d.newUsers - d.withdrawn;
    return cumulative;
  });

  const maxCumulative = Math.max(...cumulativePoints, maxValue);

  const chartHeight = 160; // 실제 바/라인이 들어가는 높이(px)
  const heightScale = chartHeight / maxValue;
  const lineScale = chartHeight / maxCumulative;

  return (
    <div className={styles.userChart}>
      {/* Y축 그리드 (0,20,40,60,80,100) */}
      <div className={styles.userChartGrid}>
        {[0, 20, 40, 60, 80, 100].map((v) => {
          const top = ((100 - v) / 100) * chartHeight + 10;
          return (
            <div
              key={v}
              className={styles.userChartGridLine}
              style={{ top }}
            />
          );
        })}
      </div>

      {/* 막대 + 누적 포인트 */}
      <div className={styles.userChartBars}>
        {data.map((item, idx) => {
          const newHeight = item.newUsers * heightScale;
          const withdrawHeight = item.withdrawn * heightScale;

          const cumulativeValue = cumulativePoints[idx];
          const cumulativeTop = 10 + chartHeight - cumulativeValue * lineScale;

          return (
            <div key={item.month} className={styles.userChartBarGroup}>
              <div
                className={styles.userChartBarNew}
                style={{ height: `${newHeight}px` }}
              />
              <div
                className={styles.userChartBarWithdraw}
                style={{ height: `${withdrawHeight}px` }}
              />
              {/* 누적 포인트 */}
              <div
                className={styles.userChartLinePoint}
                style={{
                  left: `calc(${(idx / (data.length - 1 || 1)) * 100}% + 6px)`,
                  top: cumulativeTop,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X축 라벨 */}
      <div className={styles.userChartXAxis}>
        {data.map((item) => (
          <span key={item.month}>{item.month}</span>
        ))}
      </div>

      {/* 범례 */}
      <div className={styles.userChartLegend}>
        <div className={styles.userChartLegendItem}>
          <span className={styles.legendDotNew}></span>
          <span>신규</span>
        </div>
        <div className={styles.userChartLegendItem}>
          <span className={styles.legendDotWithdraw}></span>
          <span>탈퇴</span>
        </div>
        <div className={styles.userChartLegendItem}>
          <span className={styles.legendDotTotal}></span>
          <span>누적</span>
        </div>
      </div>
    </div>
  );
}
