/* app/student/dimc/page.js */
"use client";

import styles from "./dimc.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideBarFooter from "@/components/SideBarFooter.js";

// 마이페이지처럼 메뉴 배열로 관리
const dimcSidebarMenus = [
  { text: "검사하기", href: "/student/dimc" },
  { text: "결과 확인하기", href: "/student/dimc/result" },
];

export default function DIMCPage() {
  const pathname = usePathname();

  return (
    <div className={styles.pageLayout}>
      {/* 1. 왼쪽 사이드바 */}
      <nav className={styles.sidebar}>
        {/* 로고 + 프로필 */}
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <Image
              src="/doro-logo.svg"
              alt="DORO 로고"
              width={147}
              height={38}
            />
          </div>

          <div className={styles.profileIcon}>
            <Image
              src="/profile-circle.svg"
              alt="Profile"
              width={184}
              height={184}
            />
          </div>
        </div>

        {/* DIMC 타이틀 */}
        <div className={styles.sidebarMainGroup}>
          <div className={styles.sidebarTitleContainer}>
            <div className={styles.sidebarTitleIcon}>
              <Image
                src="/note.svg"
                alt="DIMC 아이콘"
                width={25}
                height={32}
              />
            </div>
            <h2 className={styles.sidebarTitle}>DIMC</h2>
          </div>

          {/* 메뉴 리스트 (mypage 패턴) */}
          <ul className={styles.sidebarMenu}>
            {dimcSidebarMenus.map((menu) => {
              // 활성화 판단 로직
              let isActive = false;
              if (menu.href === "/student/dimc") {
                // 검사하기: /student/dimc, /student/dimc/check 모두 활성화
                isActive =
                  pathname === "/student/dimc" ||
                  pathname === "/student/dimc/check";
              } else {
                // 그 외 메뉴: 해당 href로 시작하면 활성화
                isActive = pathname.startsWith(menu.href);
              }

              return (
                <li
                  key={menu.text}
                  className={`${styles.menuItem} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  <Link href={menu.href} className={styles.menuLink}>
                    <div className={styles.menuIcon}>
                      <span className={styles.menuIconDot}></span>
                    </div>
                    {menu.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 아래 푸터 */}
        <div className={styles.sidebarFooter}>
          <SideBarFooter />
        </div>
      </nav>

      {/* 2. 오른쪽 DIMC 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        <div className={styles.waveLayer}></div>

        <div className={styles.contentLayer}>
          <h1 className={styles.dimcTitle}>DIMC</h1>
          <p className={styles.dimcSubtitle}>Digital, AI, Making, Computing</p>
          <p className={styles.dimcDescription}>
            디지털 세상을 살아가는 데 꼭 필요한 4가지 핵심 역량입니다.
            지금 나의 DIMC 역량을 평가하고, 나에게 어울리는 상어 유형을
            확인해보세요!
          </p>

          <Link href="/student/dimc/assessment" className={styles.assessButton}>
            테스트하러 가기
          </Link>
        </div>
      </main>
    </div>
  );
}
