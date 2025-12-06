/* app/student/dimc/page.js */
"use client";

import { useState } from "react"; // ✅ State 추가
import { useRouter } from "next/navigation"; // ✅ Router 추가
import styles from "./dimc.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideBarFooter from "@/components/SideBarFooter.js";

const dimcSidebarMenus = [
  { text: "검사하기", href: "/student/dimc" },
  { text: "결과 확인하기", href: "/student/dimc/result" },
];

export default function DIMCPage() {
  const pathname = usePathname();
  const router = useRouter(); // ✅ 라우터 사용

  // ✅ 로그아웃 모달 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 로고 클릭 -> 모달 열기
  const handleLogoClick = () => {
    setShowLogoutModal(true);
  };

  // 모달 확인 -> 로그아웃
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/");
  };

  // 모달 취소 -> 닫기
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className={styles.pageLayout}>
        {/* 1. 왼쪽 사이드바 */}
        <nav className={styles.sidebar}>
          {/* 로고 + 프로필 */}
          <div className={styles.sidebarTop}>
            {/* ✅ 로고 영역: 클릭 시 모달 오픈 */}
            <div 
              className={styles.sidebarLogo} 
              onClick={handleLogoClick}
              style={{ cursor: "pointer" }}
            >
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

            {/* 메뉴 리스트 */}
            <ul className={styles.sidebarMenu}>
              {dimcSidebarMenus.map((menu) => {
                let isActive = false;
                if (menu.href === "/student/dimc") {
                  isActive =
                    pathname === "/student/dimc" ||
                    pathname === "/student/dimc/check";
                } else {
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

        {/* 2. 오른쪽 DIMC 메인 콘텐츠 (기존 유지) */}
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
            <a
              href="https://dimctest.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.assessButton}
            >
              테스트하러 가기
            </a>
          </div>
        </main>
      </div>

      {/* ✅ 로그아웃 모달창 */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={handleCancelLogout}>
           <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div>
                <p className={styles.modalTitle}>로그아웃</p>
                <p className={styles.modalDesc}>정말 로그아웃 하시겠습니까?</p>
              </div>
              <div className={styles.modalButtons}>
                <button className={styles.cancelBtn} onClick={handleCancelLogout}>취소</button>
                <button className={styles.confirmBtn} onClick={handleConfirmLogout}>확인</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}