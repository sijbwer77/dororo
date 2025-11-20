// app/student/page.js

'use client'; // (usePathname 훅을 쓰려면 클라이언트 컴포넌트여야 합니다)

import styles from "./student.module.css";
import Image from "next/image";
import Link from "next/link"; 
import { usePathname } from 'next/navigation'; // 현재 주소 확인용
import { FAKE_COURSES } from "../../data/mock-courses.js"; 

// (✅ 수정!) 이 줄이 빠져서 오류가 났습니다.
import SideBarFooter from "../../components/SideBarFooter.js"; 

// 'href' (링크 주소)가 추가된 메뉴
const sidebarMenus = [
  { 
    text: "나의 강의실", 
    iconPath: "/home.svg",
    href: "/student" // '나의 강의실' 페이지 주소
  }, 
  { 
    text: "마이 페이지", 
    iconPath: "/man.svg",
    href: "/student/mypage" // '마이 페이지' 주소
  },
  { 
    text: "DIMC", 
    iconPath: "/note.svg",
    href: "#" // (임시)
  },
  { 
    text: "CHALLENGE", 
    iconPath: "/medal-star.svg",
    href: "#" // (임시)
  },
  { 
    text: "강의 만족도 조사", 
    iconPath: "/Task.svg",
    href: "#" // (임시)
  },
];

export default function StudentDashboard() {
  const pathname = usePathname(); // 현재 페이지의 주소를 가져옵니다.

  return (
    <div className={styles.pageLayout}>
      
      {/* 1. 왼쪽 사이드바 */}
      <nav className={styles.sidebar}>
        
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
              alt="프로필 아이콘"
              width={184} 
              height={184}
            />
          </div>
        </div>

        {/* 사이드바 메뉴 */}
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

        {/* 푸터 (그대로) */}
        <SideBarFooter />

      </nav>

      {/* 2. 오른쪽 메인 콘텐츠 (그대로) */}
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
  );
}