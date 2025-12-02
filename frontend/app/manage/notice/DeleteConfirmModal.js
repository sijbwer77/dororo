"use client";

import styles from "./DeleteConfirmModal.module.css";
import Image from "next/image";

export default function DeleteConfirmModal({
  title = "",
  onCancel,
  onConfirm,
}) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>

        {/* 닫기버튼 */}
        <button className={styles.closeBtn} onClick={onCancel}>
            <Image src="/Group 13900.svg" width={24} height={24} alt="닫기" />
        </button>

        {/* 메시지 */}
        <div className={styles.message}>
          <p>‘{title}’ 을(를) 정말</p>
          <p>삭제하시겠습니까?</p>
        </div>

        {/* 버튼 영역 */}
        <div className={styles.buttons}>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            예
          </button>

          <button className={styles.cancelBtn} onClick={onCancel}>
            아니요
          </button>
        </div>

      </div>
    </div>
  );
}
