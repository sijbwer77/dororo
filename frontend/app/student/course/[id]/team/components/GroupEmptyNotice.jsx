'use client';

import styles from "../team.module.css";

export default function GroupEmptyNotice({ message, showHelp = false }) {
  return (
    <div className={styles.groupEmptyContainer}>
      <h2 className={styles.groupEmptyTitle}>{message}</h2>

      {showHelp && (
        <p className={styles.groupEmptyDescription}>
          담당 선생님 또는 관리자에게 문의해주세요.
        </p>
      )}
    </div>
  );
}
