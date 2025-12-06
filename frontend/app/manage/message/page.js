// app/admin/message/page.js
"use client";

import Image from "next/image";
import styles from "./message.module.css";

export default function AdminMessagePage() {
  return (
    <div className={styles.messageLayout}>
      {/* 왼쪽 패널: 검색 + 강사/매니저 */}
      <div className={styles.leftPane}>
        {/* 검색 박스 */}
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="검색"
          />
          <button className={styles.searchButton} type="button">
            {/* 돋보기 아이콘은 나중에 너 svg로 갈아껴 */}
            <Image
              src="/search.svg"
              alt="검색"
              width={18}
              height={18}
            />
          </button>
        </div>

        {/* 강사 / 매니저 선택 박스 */}
        <div className={styles.roleBox}>
          <button className={styles.roleRow} type="button">
            <span className={styles.roleIcon}>
              {/* 여기 강사 왼쪽 짝대기 / 화살표 svg 넣으면 됨 */}
              <Image
                src="/down.svg"
                alt=""
                width={12}
                height={12}
              />
            </span>
            <span className={styles.roleLabel}>강사</span>
          </button>

          <button className={styles.roleRow} type="button">
            <span className={styles.roleIcon}>
              {/* 매니저도 같은 svg 재사용하거나 다른 거 쓰면 됨 */}
              <Image
                src="/down.svg"
                alt=""
                width={12}
                height={12}
              />
            </span>
            <span className={styles.roleLabel}>매니저</span>
          </button>
        </div>
      </div>

      {/* 오른쪽 영역: 일단 비워둠 (나중에 메시지 리스트 / 상세 넣을 자리) */}
      <div className={styles.rightPane}>{/* TODO: 나중에 구현 */}</div>
    </div>
  );
}
