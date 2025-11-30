'use client';

import { useEffect, useState } from "react";
import styles from "./student.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import SideBarFooter from "@/components/SideBarFooter.js";

const sidebarMenus = [
  { text: "나의 강의실", iconPath: "/home.svg", href: "/student" },
  { text: "마이 페이지", iconPath: "/man.svg", href: "/student/mypage" },
  { text: "DIMC", iconPath: "/note.svg", href: "/student/dimc" },
  { text: "CHALLENGE", iconPath: "/medal-star.svg", href: "#" },
  { text: "강의 만족도 조사", iconPath: "/Task.svg", href: "/student/eval" },
];

// 임시 색상
const COLORS = ["#FFB6C1", "#FFD700", "#87CEFA", "#98FB98", "#FFA07A"];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export default function StudentDashboard() {
  const pathname = usePathname();
  const [courses, setCourses] = useState([]);

  // 백엔드에서 강의 목록 가져오기
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/student/courses/", {
          credentials: "include",   // 로그인 세션 유지
        });

        if (!res.ok) throw new Error("Failed to fetch courses");

        let data = await res.json();

        // 프론트용 color, category 임시 추가
        data = data.map((c) => ({
          ...c,
          color: getRandomColor(),
          category: c.course_type || "강의", // D1 · 기초 · 1 이런 거 보여주는 코드
        }));

        setCourses(data);
      } catch (err) {
        console.error("강의 목록 불러오기 실패:", err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className={styles.pageLayout}>
      
      {/* 왼쪽 사이드바 */}
      <nav className={styles.sidebar}>
        
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <Image src="/doro-logo.svg" alt="DORO 로고" width={147} height={38} />
          </div>
          <div className={styles.profileIcon}>
            <Image src="/profile-circle.svg" alt="프로필 아이콘" width={184} height={184} />
          </div>
        </div>

        <ul className={styles.sidebarMenu}>
          {sidebarMenus.map((menu) => {
            const isActive = pathname === menu.href;

            return (
              <li key={menu.text} className={`${styles.menuItem} ${isActive ? styles.active : ""}`}>
                <Link href={menu.href} className={styles.menuLink}>
                  <div className={styles.menuIcon}>
                    <Image src={menu.iconPath} alt={`${menu.text} 아이콘`} width={30} height={30} />
                  </div>
                  {menu.text}
                </Link>
              </li>
            );
          })}
        </ul>

        <SideBarFooter />
      </nav>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        <div className={styles.courseGrid}>
          
          {courses.length === 0 && (
            <p style={{ padding: "20px", fontSize: "18px" }}>수강 중인 강의가 없습니다.</p>
          )}

          {courses.map((course) => (
            <Link href={`/student/course/${course.id}`} key={course.id} className={styles.courseCard}>
              <div className={styles.cardHeader} style={{ backgroundColor: course.color }}>
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
