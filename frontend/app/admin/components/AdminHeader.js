// app/admin/components/AdminHeader.js
"use client";

import Image from "next/image";
import styles from "../layout.module.css";

export default function AdminHeader() {
  return (
    <header className={styles.topBar}>
      {/* 왼쪽: 로고 유지 */}
      <div className={styles.topBarLogo}>
        <Image
          src="/doro-logo.svg"
          alt="DORO 로고"
          width={30}
          height={30}
        />
      </div>

      {/* 가운데 여백 */}
      <div className={styles.topBarSpacer} />

      {/* 오른쪽 상단 프로필(전체 화면 기준 자리) */}
      <div className={styles.topBarProfile}>
        <Image
          src="/profile-circle2.svg"
          alt="관리자 프로필"
          width={40}
          height={40}
        />
      </div>
    </header>
  );
}
