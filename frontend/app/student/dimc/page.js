/* app/student/dimc/page.js */
"use client";

import styles from "./dimc.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SideBarFooter from "@/components/SideBarFooter.js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 마이페이지처럼 메뉴 배열로 관리
const dimcSidebarMenus = [
  { text: "검사하기", href: "/student/dimc" },
  { text: "결과 확인하기", href: "/student/dimc/result" },
];

export default function DIMCPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const getFallback = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/profile-circle.svg`
      : "/profile-circle.svg";
  const fallback = getFallback();
  const [profileSrc, setProfileSrc] = useState(fallback);

  const normalizeProfile = (raw) => {
    if (!raw) return null;
    if (typeof raw === "string" && raw.includes("profile-circle.svg")) return getFallback();
    if (/^https?:\/\//i.test(raw)) return raw;
    let path = raw.toString().trim();
    if (!path || path === "null" || path === "None") return null;
    path = path.replace(/^\/+/, "");
    const origin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";
    return `${origin}/${path}`;
  };

  const handleProfileError = () => {
    setProfileSrc(fallback);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mypageProfileImage", fallback);
      window.dispatchEvent(
        new CustomEvent("mypageProfileImageChange", { detail: fallback })
      );
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("mypageProfileImage");
    const normalized = normalizeProfile(stored) || fallback;
    setProfileSrc(normalized);
    if (normalized !== stored) {
      window.localStorage.setItem("mypageProfileImage", normalized);
      window.dispatchEvent(
        new CustomEvent("mypageProfileImageChange", { detail: normalized })
      );
    }

    const handler = (e) => {
      const nextSrc = normalizeProfile(e.detail) || fallback;
      setProfileSrc(nextSrc);
    };
    window.addEventListener("mypageProfileImageChange", handler);
    return () => window.removeEventListener("mypageProfileImageChange", handler);
  }, []);
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
          
  return (
    <>
    <div className={styles.pageLayout}>
      {/* 1. 왼쪽 사이드바 */}
      <nav className={styles.sidebar}>
        {/* 로고 + 프로필 */}
        <div className={styles.sidebarTop}>
          <div
            className={styles.sidebarLogo}
            onClick={handleLogoClick}
            style={{ cursor: "pointer" }}
          >
            <Image src="/doro-logo.svg" alt="DORO 로고" width={147} height={38} />
          </div>

          <div className={styles.profileIcon}>
            <Image
              src={profileSrc || fallback}
              alt="Profile"
              width={184}
              height={184}
              onError={handleProfileError}
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
