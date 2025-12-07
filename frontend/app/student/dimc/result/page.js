/* app/student/dimc/result/page.js */
"use client";

import layoutStyles from "../dimc.module.css";      // 사이드바/레이아웃 공통
import styles from "./result.module.css";          // 결과 페이지 전용
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideBarFooter from "@/components/SideBarFooter.js";
import { DIMC_RESULT_SAMPLE } from "@/data/mock-dimcresult";
import { useState } from "react";
import { useRouter } from "next/navigation";

const dimcSidebarMenus = [
  { text: "검사하기", href: "/student/dimc" },
  { text: "결과 확인하기", href: "/student/dimc/result" },
];

// ✅ 유형 코드 -> 한글 이름 매핑
const TYPE_LABEL = {
  I: "인공지능 역량",
  D: "디지털 역량",
  M: "메이킹 역량",
  C: "컴퓨팅 역량",
};

export default function DIMCResultPage() {
  const pathname = usePathname();
  const router = useRouter();

  // 점수 높은 순으로 정렬
  const rankedTypes = Object.entries(DIMC_RESULT_SAMPLE.scores).sort(
    (a, b) => b[1] - a[1]
  );

  const handleLogoClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };  

  const [showLogoutModal, setShowLogoutModal] = useState(false);  

  return (
    <>
    <div className={layoutStyles.pageLayout}>
      {/* 1. 왼쪽 사이드바 (검사하기 페이지와 완전히 동일 구조) */}
      <nav className={layoutStyles.sidebar}>
        <div className={layoutStyles.sidebarTop}>
          <div 
            className={layoutStyles.sidebarLogo}
            onClick={handleLogoClick}
            style={{cursor: "pointer"}}
          >
            <Image
              src="/doro-logo.svg"
              alt="DORO 로고"
              width={147}
              height={38}
            />
          </div>
          <div className={layoutStyles.profileIcon}>
            <Image
              src="/profile-circle.svg"
              alt="Profile"
              width={184}
              height={184}
            />
          </div>
        </div>

        <div className={layoutStyles.sidebarMainGroup}>
          <div className={layoutStyles.sidebarTitleContainer}>
            <div className={layoutStyles.sidebarTitleIcon}>
              <Image src="/note.svg" alt="DIMC 아이콘" width={25} height={32} />
            </div>
            <h2 className={layoutStyles.sidebarTitle}>DIMC</h2>
          </div>

          <ul className={layoutStyles.sidebarMenu}>
            {dimcSidebarMenus.map((menu) => {
              let isActive = false;

              if (menu.href === "/student/dimc") {
                // 검사하기: /student/dimc, /student/dimc/check 모두 활성화
                isActive =
                  pathname === "/student/dimc" ||
                  pathname === "/student/dimc/check";
              } else {
                // 결과 확인하기: /student/dimc/result* 경로 전부 활성화
                isActive = pathname.startsWith(menu.href);
              }

              return (
                <li
                  key={menu.text}
                  className={`${layoutStyles.menuItem} ${
                    isActive ? layoutStyles.active : ""
                  }`}
                >
                  <Link href={menu.href} className={layoutStyles.menuLink}>
                    <div className={layoutStyles.menuIcon}>
                      <span className={layoutStyles.menuIconDot}></span>
                    </div>
                    {menu.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={layoutStyles.sidebarFooter}>
          <SideBarFooter />
        </div>
      </nav>

      {/* 2. 오른쪽: 결과 상단 다이아몬드 섹션 */}
      <main className={styles.resultMain}>
        <section className={styles.resultTopSection}>
          {/* 다이아몬드 네모 4개 */}
          <div className={styles.diamondWrapper}>
            <div className={`${styles.diamond} ${styles.diamondOuter}`}></div>
            <div className={`${styles.diamond} ${styles.diamondMid}`}></div>
            <div className={`${styles.diamond} ${styles.diamondInner}`}></div>
            <div className={`${styles.diamond} ${styles.diamondCore}`}></div>

            {/* D / I / M / C 글자 */}
            <span className={`${styles.dimcLetter} ${styles.letterD}`}>D</span>
            <span className={`${styles.dimcLetter} ${styles.letterI}`}>I</span>
            <span className={`${styles.dimcLetter} ${styles.letterM}`}>M</span>
            <span className={`${styles.dimcLetter} ${styles.letterC}`}>C</span>
          </div>

          {/* 네 개 역량 텍스트 */}
          <span className={`${styles.axisLabel} ${styles.axisDigital}`}>
            디지털 역량
          </span>
          <span className={`${styles.axisLabel} ${styles.axisMaking}`}>
            메이킹 역량
          </span>
          <span className={`${styles.axisLabel} ${styles.axisAI}`}>
            인공지능 역량
          </span>
          <span className={`${styles.axisLabel} ${styles.axisComputing}`}>
            컴퓨팅 역량
          </span>
        </section>

        {/* 3. 아래쪽 표 섹션 */}
        <section className={styles.resultBottomSection}>
          <table className={styles.resultTable}>
            <thead>
              <tr>
                <th className={styles.headerRank}>순위</th>
                <th className={styles.headerType}>유형</th>
                <th className={styles.headerResult}>결과</th>
              </tr>
            </thead>
            <tbody>
              {rankedTypes.map(([type, score], index) => (
                <tr key={type}>
                  {/* 순위 */}
                  <td className={styles.rankCell}>{index + 1}</td>

                  {/* 유형 + 퍼센트 */}
                  <td className={styles.typeCell}>
                    <span className={styles.typeLetter}>{type}</span>
                    <span className={styles.typePercent}>{score}%</span>
                    <div style={{ marginTop: 4, fontSize: 16 }}>
                      {TYPE_LABEL[type]}
                    </div>
                  </td>

                  {/* 결과 설명 */}
                  <td className={styles.resultText}>
                    {DIMC_RESULT_SAMPLE.descriptions[type]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
    {showLogoutModal && (
      <div className={layoutStyles.modalOverlay} onClick={handleCancelLogout}>
          <div className={layoutStyles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div>
              <p className={layoutStyles.modalTitle}>로그아웃</p>
              <p className={layoutStyles.modalDesc}>정말 로그아웃 하시겠습니까?</p>
            </div>
            <div className={layoutStyles.modalButtons}>
              <button className={layoutStyles.cancelBtn} onClick={handleCancelLogout}>취소</button>
              <button className={layoutStyles.confirmBtn} onClick={handleConfirmLogout}>확인</button>
            </div>
          </div>
      </div>
     )}
   </>    
  );
}
