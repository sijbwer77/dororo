/* app/components/Sidebar.js */
'use client';

import { useState } from "react"; // ✅ useState 추가
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { FAKE_COURSES } from "@/data/mock-courses";
import SideBarFooter from "@/components/SideBarFooter";

export default function Sidebar({ courseId }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // ✅ 모달 창을 보여줄지 말지 결정하는 상태
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const course = FAKE_COURSES.find((c) => c.id === Number(courseId));
  const courseName = course ? course.title : "제목을 불러오지 못했습니다.";

  const menus = [
    { text: "공지", href: `/student/course/${courseId}` },
    { text: "주차학습", href: `/student/course/${courseId}/learning` },
    { text: "과제", href: `/student/course/${courseId}/assignment` },
    { text: "팀", href: `/student/course/${courseId}/team` },
    { text: "메시지", href:`/student/course/${courseId}/message` },
  ];

  // 로고 클릭 시 -> 모달 켜기
  const handleLogoClick = () => {
    setShowLogoutModal(true);
  };

  // 모달에서 '확인' 클릭 시 -> 진짜 로그아웃
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/");
  };

  // 모달에서 '취소' 클릭 시 -> 모달 끄기
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav className={styles.sidebar}>
        <div className={styles.sidebarGroup}>
          <div className={styles.sidebarTop}>
            {/* 로고 클릭 시 handleLogoClick 실행 */}
            <div 
              className={styles.sidebarLogo} 
              onClick={handleLogoClick}
              style={{ cursor: "pointer" }}
            >
              <Image src="/doro-logo.svg" alt="DORO" width={147} height={38} />
            </div>
            <div className={styles.profileIcon}>
              <Image src="/profile-circle.svg" alt="Profile" width={184} height={184} />
            </div>
          </div>

          <div className={styles.courseTitleContainer}>
            <div className={styles.courseTitleIcon}>
              <Image src="/book-open.svg" alt="Book" width={29} height={26} />
            </div>
            <h2 className={styles.courseTitle}>{courseName}</h2>
          </div>

          <ul className={styles.sidebarMenu}>
            {menus.map((menu) => {
              const isRoot = menu.href === `/student/course/${courseId}`;
              const isActive = isRoot 
                ? pathname === menu.href 
                : pathname.startsWith(menu.href);

              return (
                <li key={menu.text} className={`${styles.menuItem} ${isActive ? styles.active : ""}`}>
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
        
        <SideBarFooter />
      </nav>

      {/* ✅ 로그아웃 모달창 (showLogoutModal이 true일 때만 보임) */}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={handleCancelLogout}>
           {/* 박스 클릭 시에는 닫히지 않도록 stopPropagation */}
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