// app/student/challenge/page.js
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./challenge.module.css";
import SideBarFooter from "@/components/SideBarFooter";
import { apiFetch } from "@/lib/api";

export default function ChallengePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/student/challenge/")
      .then((res) => setData(res))
      .catch((err) => {
        console.error(err);
        setError(err);
      });
  }, []);

  if (error) {
    return <div>챌린지 데이터를 불러오는 데 실패했어요 😢</div>;
  }

  if (!data) {
    return <div>로딩중...</div>;
  }

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
              alt="프로필"
              width={184}
              height={184}
            />
          </div>
        </div>

        <div className={styles.sidebarMainGroup}>
          {/* CHALLENGE 타이틀 영역 */}
          <div className={styles.sidebarTitleContainer}>
            <div className={styles.sidebarTitleIcon}>
              <Image
                src="/medal-star.svg"
                alt="Challenge 아이콘"
                width={25}
                height={32}
              />
            </div>
            <h2 className={styles.sidebarTitle}>CHALLENGE</h2>
          </div>
        </div>

        {/* 사이드바 하단 공통 푸터 */}
        <div className={styles.sidebarFooter}>
          <SideBarFooter />
        </div>
      </nav>

      {/* 2. 오른쪽 CHALLENGE 메인 영역 */}
      <main className={styles.challengeMain}>
        {/* ==== 상단 헤더 : 아이디 / 문제해결 / 아레나 ==== */}
        <div className={styles.challengeHeaderRow}>
          {/* solved.ac handle 그대로 */}
          <span className={styles.challengeUserName}>{data.handle}</span>

          <span className={styles.headerLabel}>문제해결</span>
          <div className={styles.headerTrophyGroup}>
            <Image
              src="/cup.svg"
              alt="문제해결 트로피"
              width={20}
              height={20}
            />
            {/* solvedCount 그대로 */}
            <span className={styles.headerNumber}>{data.solved_count}</span>
          </div>

          <span className={styles.headerBar}>|</span>

          <span className={styles.headerLabel}>아레나</span>
          {/* arenaRating 그대로 */}
          <span className={styles.headerNumber}>
            {data.arena?.rating ?? 0}
          </span>
        </div>
        <hr className={styles.challengeHeaderDivider} />

        {/* ==== 카드 3개 ==== */}
        <section className={styles.challengeCardsRow}>
          {/* 스트릭 카드 */}
          <div className={styles.challengeCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <Image
                  src="/story.svg"
                  alt="스트릭 아이콘"
                  width={18}
                  height={18}
                />
                <span className={styles.cardLabel}>최대 연속 일수</span>
              </div>
              {/* 👉 해석 안 함. 그냥 'maxStreak'라고 적어둠 */}
              <span className={styles.cardSubText}>solved.ac maxStreak</span>
            </div>
            <div className={styles.cardMainValue}>
              {data.streak?.max ?? 0}일
            </div>
          </div>

          {/* CLASS 카드 */}
          <div className={styles.challengeCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <Image
                  src="/star.svg"
                  alt="Class 아이콘"
                  width={18}
                  height={18}
                />
                {/* 👉 class 값 그대로, 아무 계산 없음 */}
                <span className={styles.cardLabel}>
                  CLASS {data.class_level ?? "-"}
                </span>
              </div>
            </div>
            <div className={styles.cardGaugeBox}>
              <div className={styles.cardGaugeCircle}>
                {/* 여기 숫자도 API 값만 다시 보여줌 */}
                <span className={styles.cardGaugeText}>
                  Lv. {data.class_level ?? "-"}
                </span>
              </div>
            </div>
          </div>

          {/* ARENA 카드 */}
          <div className={styles.challengeCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <Image
                  src="/medal-star(1).svg"
                  alt="ARENA 아이콘"
                  width={18}
                  height={18}
                />
                <span className={styles.cardLabel}>ARENA</span>
              </div>
            </div>
            <p className={styles.cardSubTextRight}>
              예정된 아레나 대회가 없습니다.
            </p>
          </div>
        </section>

        {/* 중간 문구 (이건 그냥 UI 문구라 숫자랑 상관 없음) */}
        <section className={styles.challengeInfoSection}>
          <h2 className={styles.challengeSectionTitle}>
            오늘은 아직 문제를 풀지 않았어요
          </h2>
          <hr className={styles.challengeDivider} />
        </section>

        {/* 하단: solved.ac 에서 가져온 문제들 */}
        <section className={styles.marathonSection}>
          <div className={styles.marathonHeaderRow}>
            <div className={styles.marathonTitleArea}>
              <div className={styles.marathonIconBox}>
                <Image
                  src="/person-walking.svg"
                  alt="문제 아이콘"
                  width={30}
                  height={30}
                />
              </div>
              <div>
                <div className={styles.marathonTitle}>풀어본 문제들</div>
                <div className={styles.marathonSubtitle}>
                  solved.ac API 기준으로 난이도 높은 문제 일부만 보여줘요
                </div>
              </div>
            </div>
          </div>

          <div className={styles.marathonStagesHeader}>
            <span>문제 번호</span>
            <span>제목</span>
            <span>난이도</span>
          </div>

          <div className={styles.marathonRewardRow}>
            {(!data.recent_solved_problems ||
              data.recent_solved_problems.length === 0) && (
              <div style={{ padding: "16px" }}>
                아직 solved.ac에 푼 문제가 없어요.
              </div>
            )}

            {data.recent_solved_problems?.map((p) => (
              <div key={p.problem_id} className={styles.rewardItem}>
                <span className={styles.rewardScore}>{p.problem_id}</span>
                <span className={styles.rewardPlus}>{p.title}</span>
                <span className={styles.rewardButton}>Lv. {p.level}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
