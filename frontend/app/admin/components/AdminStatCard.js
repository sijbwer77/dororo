// app/admin/components/AdminStatCard.js
"use client";

import Image from "next/image";
import styles from "../admin.module.css";

export default function AdminStatCard({ title, value, icon, large }) {
  return (
    <div
      className={`${styles.statCard} ${large ? styles.statCardLarge : ""}`}
    >
      <div className={styles.statIconBox}>
        {icon && (
          <Image src={icon} alt={title} width={62} height={62} className={styles.statIcon} />
        )}
      </div>
      <div className={styles.statTextBox}>
        <div className={styles.statTitle}>{title}</div>
        <div className={styles.statValue}>{value}</div>
      </div>
    </div>
  );
}
