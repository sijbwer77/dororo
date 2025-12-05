// app/admin/layout.js
"use client";

import styles from "./layout.module.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminPage}>
      {/* 위쪽 고정 헤더 */}
      <div className={styles.globalHeader}>
        <AdminHeader />
      </div>

      {/* 왼쪽 고정 사이드바 + 오른쪽 페이지 내용 */}
      <div className={styles.bodyWrapper}>
        <AdminSidebar />

        <div className={styles.contentArea}>
          <main className={styles.dashboard}>{children}</main>
        </div>
      </div>
    </div>
  );
}
