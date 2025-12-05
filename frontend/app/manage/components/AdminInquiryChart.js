// app/admin/components/AdminInquiryChart.js
"use client";

import styles from "../admin.module.css";

export default function AdminInquiryChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className={styles.inquiryChart}>
      {data.map((item) => (
        <div key={item.label} className={styles.inquiryRow}>
          <div className={styles.inquiryLabel}>{item.label}</div>
          <div className={styles.inquiryBarWrapper}>
            <div
              className={styles.inquiryBar}
              style={{
                width: `${(item.count / maxCount) * 100}%`,
              }}
            />
          </div>
          <div className={styles.inquiryCount}>{item.count}건</div>
        </div>
      ))}
    </div>
  );
}
