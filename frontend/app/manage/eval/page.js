// app/admin/eval/page.js
"use client";

import { useState } from "react";
import styles from "./eval.module.css";
import { useRouter } from "next/navigation";

const STAT_CARDS = [
  { label: "총 강의 수", value: "30" },
  { label: "평가 완료 비율", value: "75%" },
  { label: "평균 만족도", value: "4.2" },
];

const TOP_COURSES = [
  {
    name: "내 손으로 만드는 무한의 계단",
    shortName: "무한의 계단",
    code: "D1/기초/1",
    teacher: "김철수",
    avg: 4.5,
    max: 5,
    min: 3,
    count: 26,
    details: { satisfaction: 5.0, difficulty: 4.2, material: 4.7, communication: 5.0 },
    comments: [
      "강의가 매우 이해하기 쉬웠어요.",
      "자료가 보기 편했지만 속도가 조금 빨라서 따라가기 힘들었어요.",
      "바로바로 피드백을 주셔서 좋았어요.",
      "재밌어요"
    ]
  },
  {
    name: "Vrew로 손쉽게 만드는 유튜브 쇼츠",
    shortName: "유튜브 쇼츠",
    code: "D2/활용/3",
    teacher: "이영희",
    avg: 4.2,
    max: 5,
    min: 2,
    count: 31,
    details: { satisfaction: 4.2, difficulty: 3.8, material: 4.5, communication: 4.0 },
    comments: [
      "영상 편집이 이렇게 쉬운줄 몰랐어요!",
      "실습 시간이 조금 더 길었으면 좋겠어요.",
      "유익한 시간이었습니다."
    ]
  },
  {
    name: "여기도, 저기도 블루투스?",
    shortName: "블루투스?",
    code: "H1/하드웨어/2",
    teacher: "박민수",
    avg: 4.7,
    max: 4,
    min: 4,
    count: 19,
    details: { satisfaction: 4.8, difficulty: 4.5, material: 4.2, communication: 4.9 },
    comments: [
      "아두이노 연결이 신기해요.",
      "조금 어려웠지만 보람찼습니다.",
      "원리가 이해가 잘 돼요."
    ]
  },
  {
    name: "마인크래프트, 어디까지 해봤니?",
    shortName: "마인크래프트",
    code: "G1/게임/1",
    teacher: "최지훈",
    avg: 5.0,
    max: 5,
    min: 5,
    count: 22,
    details: { satisfaction: 5.0, difficulty: 2.0, material: 5.0, communication: 5.0 },
    comments: [
      "최고의 강의!",
      "또 듣고 싶어요.",
      "코딩이 게임처럼 느껴져요."
    ]
  },
  {
    name: "DORO 해커톤",
    shortName: "DORO 해커톤",
    code: "S1/심화/5",
    teacher: "정수진",
    avg: 4.3,
    max: 5,
    min: 3,
    count: 28,
    details: { satisfaction: 4.3, difficulty: 4.8, material: 4.0, communication: 4.5 },
    comments: [
      "밤새면서 코딩하는게 힘들었지만 뿌듯해요.",
      "팀원들과 협업하는 법을 배웠어요."
    ]
  },
];

const MAX_SCORE = 5;

export default function AdminEvalPage() {
  // [기능] 라우터 초기화
  const router = useRouter();

  // [기능] 현재 선택된 강의의 인덱스 (0번부터 시작)
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentData = TOP_COURSES[currentIndex];

  // [기능] 이전 강의로 이동
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TOP_COURSES.length - 1 : prev - 1));
  };

  // [기능] 다음 강의로 이동
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TOP_COURSES.length - 1 ? 0 : prev + 1));
  };

  // [기능] 더보기 버튼 클릭 핸들러 (상세 페이지 이동)
  const handleMoreClick = () => {
      // [추천] "detail"이라는 글자 대신, 현재 보고 있는 강의 번호(currentIndex)를 보냅니다.
      // 예: /admin/eval/0, /admin/eval/1 ...
      router.push(`/manage/eval/${currentIndex}`); 
    };

  return (
    <div className={styles.evalPage}>
      
      {/* ================= 왼쪽 기둥 (메인 영역) ================= */}
      <div className={styles.mainColumn}>
        
        {/* 1. 상단 통계 카드 3개 */}
        <section className={styles.statRow}>
          {STAT_CARDS.map((card) => (
            <div key={card.label} className={styles.statCard}>
              <div className={styles.statLabel}>{card.label}</div>
              <div className={styles.statValue}>{card.value}</div>
            </div>
          ))}
        </section>

        {/* 2. 그래프 영역 */}
        <section className={styles.chartSection}>
          <h3 className={styles.chartTitle}>강의별 평균 점수 (TOP 5)</h3>
          <div className={styles.chartArea}>
            <div className={styles.yAxis}>
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className={styles.yAxisRow}>
                  <span className={styles.yAxisLabel}>{n}</span>
                  <span className={styles.yAxisLine} />
                </div>
              ))}
            </div>
            <div className={styles.barArea}>
              {TOP_COURSES.map((c, idx) => (
                <div key={c.name} className={styles.barItem}>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{ 
                        height: `${(c.avg / MAX_SCORE) * 196}px`,
                        opacity: idx === currentIndex ? 1 : 0.4,
                        transition: "opacity 0.3s"
                      }}
                    ></div>
                  </div>
                  <div 
                    className={styles.barLabel}
                    style={{ fontWeight: idx === currentIndex ? 'bold' : 'normal'}}
                  >
                    {c.shortName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. 표 영역 */}
        <section className={styles.tableSection}>
          <div className={styles.tableDecorationTop} />
          <table className={styles.evalTable}>
            <thead>
              <tr>
                <th>강의명</th>
                <th>강사명</th>
                <th>평균 점수</th>
                <th>최고점</th>
                <th>최하점</th>
                <th>응답 수</th>
              </tr>
            </thead>
            <tbody>
              {TOP_COURSES.map((c, idx) => (
                <tr 
                  key={c.name}
                  style={{ backgroundColor: idx === currentIndex ? '#f0f7ff' : 'transparent', transition: 'background-color 0.2s' }}
                >
                  <td>{c.name}</td>
                  <td>{c.teacher}</td>
                  <td>{c.avg.toFixed(1)}</td>
                  <td>{c.max}</td>
                  <td>{c.min}</td>
                  <td>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        
      </div>

      {/* ================= 오른쪽 기둥 (사이드바) ================= */}
      <aside className={styles.sideColumn}>
        <div className={styles.detailCard}>
          <div className={styles.detailHeaderBg} />
          
          <h2 className={styles.detailTitle}>{currentData.name}</h2>
          <div className={styles.detailSub}>{currentData.code}</div>
          
          <div className={styles.detailMetaRow}>
            <span className={styles.detailMetaLabel}>강사명</span>
            <span className={styles.detailMetaValue}>{currentData.teacher}</span>
          </div>

          <div className={styles.detailNav}>
            <button onClick={handlePrev} className={styles.navButton}>&lt;</button>
            <span className={styles.navDivider}>/</span>
            <button onClick={handleNext} className={styles.navButton}>&gt;</button>
          </div>

          <div className={styles.metricList}>
            <MetricRow label="강의 내용 만족도" value={currentData.details.satisfaction} ratio={currentData.details.satisfaction / 5} />
            <MetricRow label="난이도 적정성" value={currentData.details.difficulty} ratio={currentData.details.difficulty / 5} />
            <MetricRow label="수업 자료 품질" value={currentData.details.material} ratio={currentData.details.material / 5} />
            <MetricRow label="소통 및 피드백" value={currentData.details.communication} ratio={currentData.details.communication / 5} />
          </div>

          <div className={styles.commentBlock}>
            <div className={styles.commentTitle}>학생 코멘트</div>
            {currentData.comments.map((comment, i) => (
              <p key={i}>“{comment}”</p>
            ))}
            
            {/* [수정됨] onClick 이벤트 추가 */}
            <button onClick={handleMoreClick} className={styles.moreButton}>더보기 &gt;</button>
          </div>
        </div>
      </aside>

    </div>
  );
}

function MetricRow({ label, value, ratio }) {
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricBarBg}>
        <div
          className={styles.metricBarFill}
          style={{ width: `${ratio * 128}px`, transition: "width 0.3s" }}
        />
      </div>
      <span className={styles.metricValue}>{value.toFixed(1)}</span>
    </div>
  );
}
