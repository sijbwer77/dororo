// app/student/page.js

'use client'; 

import { useState } from "react"; // ✅ State 추가
import { useRouter } from "next/navigation"; // ✅ Router 추가
import styles from "./student.module.css";
import Image from "next/image";
import Link from "next/link"; 
import { usePathname } from 'next/navigation'; 
import { FAKE_COURSES } from "@/data/mock-courses.js"; 
import SideBarFooter from "@/components/SideBarFooter.js"; 

const sidebarMenus = [
  { text: "나의 강의실", iconPath: "/home.svg", href: "/student" }, 
  { text: "마이 페이지", iconPath: "/man.svg", href: "/student/mypage" },
  { text: "DIMC", iconPath: "/note.svg", href: '/student/dimc' },
  { text: "CHALLENGE", iconPath: "/medal-star.svg", href: '/student/challenge' },
  { text: "강의 만족도 조사", iconPath: "/Task.svg", href: "/student/eval" },
];

export default function StudentDashboard() {
  const pathname = usePathname(); 
  const router = useRouter(); // ✅ 라우터

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
                alt="프로필 아이콘"
                width={184} 
                height={184}
              />
            </div>
          </div>

          <ul className={styles.sidebarMenu}>
            {sidebarMenus.map((menu) => {
              const isActive = pathname === menu.href;

              return (
                <li
                  key={menu.text}
                  className={`${styles.menuItem} ${isActive ? styles.active : ""}`}
                >
                  <Link href={menu.href} className={styles.menuLink}>
                    <div className={styles.menuIcon}>
                      <Image
                        src={menu.iconPath} 
                        alt={`${menu.text} 아이콘`}
                        width={30} 
                        height={30} 
                      />
                    </div>
                    {menu.text}
                  </Link>
                </li>
              );
            })}
          </ul>

          <SideBarFooter />
        </nav>

        {/* 2. 오른쪽 메인 콘텐츠 */}
        <main className={styles.mainContent}>
          <div className={styles.courseGrid}>
            {FAKE_COURSES.map((course) => (
              <Link href={`/student/course/${course.id}`} key={course.id} className={styles.courseCard}>
                <div 
                  className={styles.cardHeader} 
                  style={{ backgroundColor: course.color }} 
                >
                  <span className={styles.cardCategory}>{course.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardTitle}>{course.title}</p>
                </div>
              </Link>
            ))}
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