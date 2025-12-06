// frontend/app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./admin.module.css";
import AdminStatCard from "./components/AdminStatCard";
import AdminUserChart from "./components/AdminUserChart";
import AdminInquiryChart from "./components/AdminInquiryChart";

const userStats = [
  { month: "7월", newUsers: 100, withdrawn: 20 },
  { month: "8월", newUsers: 80, withdrawn: 15 },
  { month: "9월", newUsers: 120, withdrawn: 18 },
  { month: "10월", newUsers: 90, withdrawn: 25 },
  { month: "11월", newUsers: 110, withdrawn: 10 },
  { month: "12월", newUsers: 130, withdrawn: 22 },
];

const inquiryData = [
  { label: "강의 수강 신청 관련 문의", count: 8 },
  { label: "결제/환불 문의", count: 5 },
  { label: "계정/로그인 문제", count: 2 },
  { label: "과제 업로드 오류", count: 4 },
  { label: "운영 정책 문의", count: 3 },
  { label: "기타", count: 1 },
];

const popularCourses = [
  { rank: 1, title: "마인크래프트, 어디까지 해봤니?", teacher: "강개발", students: 50 },
  { rank: 2, title: "내 손으로 만드는 무한의 계단", teacher: "김개발", students: 45 },
  { rank: 3, title: "Vrew로 손쉽게 만드는 유튜브 쇼츠", teacher: "이개발", students: 38 },
  { rank: 4, title: "여기도, 저기도 블루투스?", teacher: "박개발", students: 30 },
  { rank: 5, title: "DORO 해커톤", teacher: "최개발", students: 28 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [todayDate, setTodayDate] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 1) 내 정보 조회해서 role 확인
        const meRes = await fetch("http://localhost:8000/api/user/me/", {
          credentials: "include",
        });
        if (!meRes.ok) throw new Error("auth failed");

        const me = await meRes.json();
        if (me.role !== "MG") {
          alert("매니저만 접근할 수 있는 페이지입니다.");
          router.replace("/");
          return;
        }

        // 2) 날짜 세팅
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        setTodayDate(`${year}.${month}.${day}`);

        setReady(true);
      } catch (e) {
        console.error("관리자 대시보드 로딩 실패:", e);
        router.replace("/");
      }
    };

    init();
  }, [router]);

  if (!ready) return null;

  return (
    <>
      {/* 날짜 */}
      <section className={styles.dateSection}>
        <span className={styles.todayBadge}>Today</span>
        <span className={styles.todayDate}>{todayDate}</span>
      </section>

      {/* 통계 카드 */}
      <section className={styles.statContainer}>
        <AdminStatCard title="학생 수" value="1,000" icon="user.svg" />
        <AdminStatCard title="강사 수" value="20" icon="book.svg" />
        <AdminStatCard title="문의 상황" value="13" icon="headphones.svg" />
        <AdminStatCard
          title="월간 수강료 총액"
          value="20,000,000 원"
          icon="Coins 1.svg"
          large
        />
      </section>

      {/* 중간 그래프 2개 */}
      <section className={styles.graphRow}>
        <div className={styles.graphBox}>
          <h3 className={styles.graphTitle}>사용자 현황</h3>
          <AdminUserChart data={userStats} />
        </div>

        <div className={styles.graphBox}>
          <h3 className={styles.graphTitle}>1:1 상담 문의 유형별 건수</h3>
          <AdminInquiryChart data={inquiryData} />
        </div>
      </section>

      {/* 도넛 + 인기 강의 */}
      <section className={styles.bottomRow}>
        <div className={styles.graphBox}>
          <h3 className={styles.graphTitle}>강의 만족도 평가 (통합)</h3>

          <div className={styles.evalDonutRow}>
            <div className={styles.evalDonutWrapper}>
              <Image src="/donut.svg" alt="강의 만족도 도넛" width={258} height={252} />
            </div>

            <div className={styles.evalLegendColumn}>
              <div className={styles.evalLegendRow}>
                <span className={`${styles.evalLegendColor} ${styles.evalLegendColorBlue}`} />
                <span>매우 만족 42%</span>
              </div>
              <div className={styles.evalLegendRow}>
                <span className={`${styles.evalLegendColor} ${styles.evalLegendColorPink}`} />
                <span>만족 38%</span>
              </div>
              <div className={styles.evalLegendRow}>
                <span className={`${styles.evalLegendColor} ${styles.evalLegendColorPurple}`} />
                <span>보통 17%</span>
              </div>
              <div className={styles.evalLegendRow}>
                <span className={`${styles.evalLegendColor} ${styles.evalLegendColorYellow}`} />
                <span>불만족 3%</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.graphBox}>
          <h3 className={styles.graphTitle}>인기 강의 Best 5</h3>

          <table className={styles.bestTable}>
            <thead>
              <tr>
                <th className={styles.bestColRank}>순위</th>
                <th className={styles.bestColTitle}>강의명</th>
                <th className={styles.bestColTeacher}>강사명</th>
                <th className={styles.bestColStudents}>수강자 수</th>
              </tr>
            </thead>
            <tbody>
              {popularCourses.map((course) => (
                <tr key={course.rank}>
                  <td className={styles.bestRankCell}>{course.rank}</td>
                  <td className={styles.bestTitleCell}>{course.title}</td>
                  <td>{course.teacher}</td>
                  <td>{course.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
