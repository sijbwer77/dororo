// app/student/challenge/page.js
"use client";

import Image from "next/image";
import styles from "./challenge.module.css";
import SideBarFooter from "@/components/SideBarFooter";

export default function ChallengePage() {
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
        {/* ==== 상단 헤더 : seobin321 / 문제해결 / 아레나 ==== */}
        <div className={styles.challengeHeaderRow}>
          <span className={styles.challengeUserName}>seobin321</span>

          <span className={styles.headerLabel}>문제해결</span>
          <div className={styles.headerTrophyGroup}>
            {/* 프로젝트에 있는 트로피 아이콘 경로 사용 */}
            <Image
              src="/cup.svg"
              alt="문제해결 트로피"
              width={20}
              height={20}
            />
            <span className={styles.headerNumber}>540</span>
          </div>

          <span className={styles.headerBar}>|</span>

          <span className={styles.headerLabel}>아레나</span>
          <span className={styles.headerNumber}>0</span>
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
                <span className={styles.cardLabel}>스트릭</span>
              </div>
              <span className={styles.cardSubText}>오늘 풀면 7일</span>
            </div>
            <div className={styles.cardMainValue}>6일</div>
          </div>

          {/* CLASS 2 카드 */}
          <div className={styles.challengeCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <Image
                  src="/star.svg"
                  alt="Class 아이콘"
                  width={18}
                  height={18}
                />
                <span className={styles.cardLabel}>CLASS 2</span>
              </div>
            </div>
            <div className={styles.cardGaugeBox}>
              <div className={styles.cardGaugeCircle}>
                <span className={styles.cardGaugeText}>50%</span>
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

        {/* 중간 문구 */}
        <section className={styles.challengeInfoSection}>
          <h2 className={styles.challengeSectionTitle}>
            오늘은 아직 문제를 풀지 않았어요
          </h2>
          <hr className={styles.challengeDivider} />
        </section>

        {/* 하단 마라톤 영역 */}
        <section className={styles.marathonSection}>
          <div className={styles.marathonHeaderRow}>
            <div className={styles.marathonTitleArea}>
              <div className={styles.marathonIconBox}>
                <Image
                  src="/person-walking.svg"
                  alt="마라톤 아이콘"
                  width={30}
                  height={30}
                />
              </div>
              <div>
                <div className={styles.marathonTitle}>랜덤 마라톤 73</div>
                <div className={styles.marathonSubtitle}>3일 후 종료</div>
              </div>
            </div>
            <button className={styles.refreshButton}>
              <Image
                src="/rotate-left.svg"
                alt="새로고침"
                width={20}
                height={20}
              />
            </button>
          </div>

          {/* A~E 5개의 구간 */}
          <div className={styles.marathonStagesHeader}>
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span>D</span>
            <span>E</span>
          </div>

          {/* 보상 아이콘 & 점수 */}
          <div className={styles.marathonRewardRow}>
            {/* A */}
            <div className={styles.rewardItem}>
              <div className={styles.rewardIconCup}>
                <Image
                  src="/cup.svg"
                  alt="트로피"
                  width={25}
                  height={25}
                />
              </div>
              <span className={styles.rewardScore}>26489</span>
              <span className={styles.rewardPlus}>+50</span>
              <button className={styles.rewardButton}>받기</button>
            </div>

            {/* B */}
            <div className={styles.rewardItem}>
              <div className={styles.rewardIconCup}>
                <Image
                  src="/cup.svg"
                  alt="트로피"
                  width={25}
                  height={25}
                />
              </div>
              <span className={styles.rewardScore}>23825</span>
              <span className={styles.rewardPlus}>+75</span>
              <button className={styles.rewardButton}>받기</button>
            </div>

            {/* C */}
            <div className={styles.rewardItem}>
              <div className={styles.rewardIconCup}>
                <Image
                  src="/cup.svg"
                  alt="트로피"
                  width={25}
                  height={25}
                />
              </div>
              <span className={styles.rewardScore}>15025</span>
              <span className={styles.rewardPlus}>+75</span>
              <button className={styles.rewardButton}>받기</button>
            </div>

            {/* D */}
            <div className={styles.rewardItem}>
              <div className={styles.rewardIconCup}>
                <Image
                  src="/cup.svg"
                  alt="트로피"
                  width={25}
                  height={25}
                />
              </div>
              <span className={styles.rewardScore}>7366</span>
              <span className={styles.rewardPlus}>+100</span>
              <button className={styles.rewardButton}>받기</button>
            </div>

            {/* E */}
            <div className={styles.rewardItem}>
              <div className={styles.rewardIconCupPrimary}>
                <Image
                  src="/cup (1).svg" // 필요하면 /cup-blue.svg 같은 다른 색으로 교체
                  alt="트로피"
                  width={25}
                  height={25}
                />
              </div>
              <span className={styles.rewardScore}>11531</span>
              <span className={styles.rewardPlus}>+100</span>
              <button className={styles.rewardButton}>받기</button>
            </div>
          </div>

          <div className={styles.marathonFooter}>
            <span>난이도 4.20</span>
            <span>퍼포먼스 0.00</span>
            <span className={styles.totalDistance}>총 0.000km</span>
          </div>
        </section>
      </main>
    </div>
  );
}
