/* app/components/Sidebar.js */
'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { FAKE_COURSES } from "@/data/mock-courses";
import SideBarFooter from "@/components/SideBarFooter";
import { useState } from "react";

export default function Sidebar({ courseId }) {
  const pathname = usePathname();
  const router = useRouter();
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
    <nav className={styles.sidebar}>
      <div className={styles.sidebarGroup}>
        <div className={styles.sidebarTop}>
          <div 
            className={styles.sidebarLogo}
            onCLick = {handleLogoClick}
            style={{cursor: "pointer"}}
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
            // 2. 활성화 여부 판별 로직
            // 메인(공지) 페이지는 주소가 정확히 일치할 때만 활성화
            // 다른 메뉴(과제, 팀 등)는 하위 페이지(/team/meeting/1 등)에서도 활성화되어야 하므로 startsWith 사용
            const isRoot = menu.href === `/student/course/${courseId}`;
            const isActive = isRoot 
              ? pathname === menu.href 
              : pathname.startsWith(menu.href);

            return (
              <li key={menu.text} className={`${styles.menuItem} ${isActive ? styles.active : ""}`}>
                <Link href={menu.href} className={styles.menuLink}>
                  <div className={styles.menuIcon}>
                    {/* 3. 활성화되면 아이콘 점 색깔도 하얗게 바뀜 (CSS 처리) */}
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
