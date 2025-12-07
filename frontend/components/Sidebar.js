/* app/components/Sidebar.js */
'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
// import { FAKE_COURSES } from "@/data/mock-courses"; // <--- [삭제] 더 이상 가짜 데이터 안 씀
import SideBarFooter from "@/components/SideBarFooter";
import { useState, useEffect } from "react"; // <--- [수정] useEffect 추가

export default function Sidebar({ courseId }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // [추가] 백엔드에서 가져온 강의 제목을 저장할 state
  const [courseTitle, setCourseTitle] = useState("");

  // [추가] 백엔드 API 호출해서 진짜 강의 제목 가져오기
  useEffect(() => {
    if (!courseId) return;

    const fetchCourseInfo = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/student/course/${courseId}/info/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 세션(로그인 정보) 포함
        });

        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.title); // 받아온 제목으로 업데이트
        } else {
          setCourseTitle("강의 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("Sidebar Fetch Error:", error);
        setCourseTitle("오류 발생");
      }
    };

    fetchCourseInfo();
  }, [courseId]);


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
            onClick={handleLogoClick}
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
          {/* [수정] state에 저장된 courseTitle을 보여줌 */}
          <h2 className={styles.courseTitle}>{courseTitle}</h2>
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
    
    {/* 로그아웃 모달 부분은 그대로 유지 */}
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