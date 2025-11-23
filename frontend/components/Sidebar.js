/* app/components/Sidebar.js */
'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./Sidebar.module.css";
import { FAKE_COURSES } from "@/data/mock-courses";
import SideBarFooter from "@/components/SideBarFooter";

/**
 * 공용 Sidebar 컴포넌트
 * - courseId가 있으면 과목 전용 메뉴 + 과목 타이틀을 렌더링
 * - variant="mypage" 혹은 customMenus를 주면 마이페이지/임의 메뉴로 사용 가능
 */
export default function Sidebar({
  courseId,
  variant = "course",
  customMenus,
  customTitle,
  customIconSrc,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMyPage = variant === "mypage";
  const tabParam = isMyPage ? searchParams?.get("tab") : null;

  const course = FAKE_COURSES.find((c) => c.id === Number(courseId));
  const courseName = course ? course.title : "과목 상세";

  const defaultCourseMenus = [
    { key: "notice", text: "공지", href: `/student/course/${courseId}` },
    { key: "learning", text: "주차학습", href: `/student/course/${courseId}/learning` },
    { key: "assignment", text: "과제", href: `/student/course/${courseId}/assignment` },
    { key: "team", text: "팀", href: `/student/course/${courseId}/team` },
    { key: "message", text: "메시지", href: `/student/course/${courseId}/message` },
  ];

  const defaultMyPageMenus = [
    { key: "info", text: "내 정보", href: "/student/mypage?tab=info" },
    { key: "level", text: "My Level", href: "/student/mypage?tab=level" },
    { key: "counsel", text: "1:1 상담", href: "/student/mypage?tab=counsel" },
    { key: "schedule", text: "수업 일정", href: "/student/mypage?tab=schedule" },
  ];

  const menus = customMenus || (isMyPage ? defaultMyPageMenus : defaultCourseMenus);
  const headerTitle = customTitle || (isMyPage ? "마이 페이지" : courseName);
  const headerIcon = customIconSrc || (isMyPage ? "/man.svg" : "/book-open.svg");
  const headerIconSize = isMyPage ? { width: 25, height: 32 } : { width: 29, height: 26 };

  // mypage 활성 탭 결정: 쿼리 탭 우선, 없으면 서브경로 매핑
  const activeMyPageKey =
    tabParam ||
    (pathname.includes("/attendance") ? "schedule" : null) ||
    "info";

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
            <Image src={headerIcon} alt="Title Icon" width={headerIconSize.width} height={headerIconSize.height} />
          </div>
          <h2 className={styles.courseTitle}>{headerTitle}</h2>
        </div>

        <ul className={styles.sidebarMenu}>
          {menus.map((menu) => {
            const baseHref = menu.href.split("?")[0];
            const isRoot = pathname === menu.href || pathname === baseHref;
            const isActive = isMyPage
              ? menu.key === activeMyPageKey
              : isRoot || pathname.startsWith(baseHref);

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
  );
}
