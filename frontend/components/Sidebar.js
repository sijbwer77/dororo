/* app/components/Sidebar.js */
'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { FAKE_COURSES } from "@/data/mock-courses";
import SideBarFooter from "@/components/SideBarFooter";

export default function Sidebar({ courseId }) {
  const pathname = usePathname(); // 1. 현재 주소 가져오기
  
  const course = FAKE_COURSES.find((c) => c.id === Number(courseId));
  const courseName = course ? course.title : "과목 상세";

  const menus = [
    { text: "공지", href: `/student/course/${courseId}` },
    { text: "주차학습", href: `/student/course/${courseId}/learning` },
    { text: "과제", href: `/student/course/${courseId}/assignment` },
    { text: "팀", href: `/student/course/${courseId}/team` },
    { text: "메시지", href:`/student/course/${courseId}/message` },
  ];

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarGroup}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
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
  );
}