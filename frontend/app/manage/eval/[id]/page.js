// app/admin/eval/[id]/page.js
"use client";

import { useRouter, useParams } from "next/navigation";
import styles from "./detail.module.css";

// [데이터] 메인 페이지와 동일한 데이터 리스트 (실제로는 DB에서 가져와야 함)
const TOP_COURSES = [
  {
    name: "내 손으로 만드는 무한의 계단",
    info: "D1/기초/1 | 강사명 김철수",
    surveys: [
      { label: "강의 내용이 체계적이었나요?", score: 4.2 },
      { label: "강사가 내용을 잘 전달했나요?", score: 4.5 },
      { label: "수업 자료가 도움이 되었나요?", score: 4.2 },
      { label: "실습 시간이 충분했나요?", score: 4.0 },
      { label: "강의 속도는 적절했나요?", score: 4.2 },
      { label: "질문에 대한 답변이 좋았나요?", score: 4.8 },
      { label: "강의실 환경은 쾌적했나요?", score: 4.2 },
      { label: "다음 단계 강의를 듣고 싶나요?", score: 4.5 },
      { label: "주변에 추천하고 싶나요?", score: 4.2 },
    ],
    comments: [
      "강의가 매우 이해하기 쉬웠어요.",
      "자료가 보기 편했지만 속도가 조금 빨라서 따라가기 힘들었어요.",
      "바로바로 피드백을 주셔서 좋았어요.",
      "재밌어요"
    ]
  },
  {
    name: "Vrew로 손쉽게 만드는 유튜브 쇼츠",
    info: "D2/활용/3 | 강사명 이영희",
    surveys: [
      { label: "강의 내용이 체계적이었나요?", score: 4.0 },
      { label: "강사가 내용을 잘 전달했나요?", score: 4.2 },
      { label: "수업 자료가 도움이 되었나요?", score: 4.5 },
      { label: "실습 시간이 충분했나요?", score: 3.8 },
      { label: "강의 속도는 적절했나요?", score: 4.0 },
      { label: "질문에 대한 답변이 좋았나요?", score: 4.5 },
      { label: "강의실 환경은 쾌적했나요?", score: 4.2 },
      { label: "다음 단계 강의를 듣고 싶나요?", score: 4.2 },
      { label: "주변에 추천하고 싶나요?", score: 4.0 },
    ],
    comments: [
      "영상 편집이 이렇게 쉬운줄 몰랐어요!",
      "실습 시간이 조금 더 길었으면 좋겠어요.",
      "유익한 시간이었습니다."
    ]
  },
  {
    name: "여기도, 저기도 블루투스?",
    info: "H1/하드웨어/2 | 강사명 박민수",
    surveys: [
      { label: "강의 내용이 체계적이었나요?", score: 4.8 },
      { label: "강사가 내용을 잘 전달했나요?", score: 4.7 },
      { label: "수업 자료가 도움이 되었나요?", score: 4.2 },
      { label: "실습 시간이 충분했나요?", score: 4.5 },
      { label: "강의 속도는 적절했나요?", score: 4.6 },
      { label: "질문에 대한 답변이 좋았나요?", score: 4.9 },
      { label: "강의실 환경은 쾌적했나요?", score: 4.5 },
      { label: "다음 단계 강의를 듣고 싶나요?", score: 4.8 },
      { label: "주변에 추천하고 싶나요?", score: 4.7 },
    ],
    comments: [
      "아두이노 연결이 신기해요.",
      "조금 어려웠지만 보람찼습니다.",
      "원리가 이해가 잘 돼요."
    ]
  },
  {
    name: "마인크래프트, 어디까지 해봤니?",
    info: "G1/게임/1 | 강사명 최지훈",
    surveys: [
      { label: "강의 내용이 체계적이었나요?", score: 5.0 },
      { label: "강사가 내용을 잘 전달했나요?", score: 5.0 },
      { label: "수업 자료가 도움이 되었나요?", score: 5.0 },
      { label: "실습 시간이 충분했나요?", score: 5.0 },
      { label: "강의 속도는 적절했나요?", score: 5.0 },
      { label: "질문에 대한 답변이 좋았나요?", score: 5.0 },
      { label: "강의실 환경은 쾌적했나요?", score: 4.8 },
      { label: "다음 단계 강의를 듣고 싶나요?", score: 5.0 },
      { label: "주변에 추천하고 싶나요?", score: 5.0 },
    ],
    comments: [
      "최고의 강의!",
      "또 듣고 싶어요.",
      "코딩이 게임처럼 느껴져요."
    ]
  },
  {
    name: "DORO 해커톤",
    info: "S1/심화/5 | 강사명 정수진",
    surveys: [
      { label: "강의 내용이 체계적이었나요?", score: 4.3 },
      { label: "강사가 내용을 잘 전달했나요?", score: 4.5 },
      { label: "수업 자료가 도움이 되었나요?", score: 4.0 },
      { label: "실습 시간이 충분했나요?", score: 4.8 },
      { label: "강의 속도는 적절했나요?", score: 4.2 },
      { label: "질문에 대한 답변이 좋았나요?", score: 4.5 },
      { label: "강의실 환경은 쾌적했나요?", score: 4.0 },
      { label: "다음 단계 강의를 듣고 싶나요?", score: 4.5 },
      { label: "주변에 추천하고 싶나요?", score: 4.3 },
    ],
    comments: [
      "밤새면서 코딩하는게 힘들었지만 뿌듯해요.",
      "팀원들과 협업하는 법을 배웠어요."
    ]
  },
];

export default function AdminEvalDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const id = params.id;
  const courseIndex = Number(id) || 0;
  const COURSE_DETAIL = TOP_COURSES[courseIndex] || TOP_COURSES[0];

  return (
    <div className={styles.container}>
      
      {/* 헤더 */}
      <header className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.backButton}>&lt;</button>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.courseTitle}>{COURSE_DETAIL.name}</h1>
          <span className={styles.courseInfo}>{COURSE_DETAIL.info}</span>
        </div>
      </header>

      {/* 본문 */}
      <div className={styles.contentBody}>
        
        {/* [왼쪽] 만족도 조사 */}
        <section className={styles.leftSection}>
          {COURSE_DETAIL.surveys.map((item, index) => (
            <div key={index} className={styles.surveyRow}>
              <div className={styles.surveyLabel}>{item.label}</div>
              <div className={styles.barContainer}>
                <div className={styles.barBackground}>
                  <div 
                    className={styles.barFill} 
                    style={{ width: `${(item.score / 5) * 100}%` }} 
                  />
                </div>
              </div>
              <div className={styles.scoreValue}>
                {item.score.toFixed(1)}
              </div>
            </div>
          ))}
        </section>

        {/* [오른쪽] 학생 코멘트 (여기가 안 나오면 CSS 문제입니다!) */}
        <section className={styles.rightSection}>
          <h2 className={styles.commentHeader}>학생 코멘트</h2>
          
          <div className={styles.commentList}>
            {/* 코멘트가 있으면 출력, 없으면 안내 문구 */}
            {COURSE_DETAIL.comments && COURSE_DETAIL.comments.length > 0 ? (
              COURSE_DETAIL.comments.map((comment, index) => (
                <div key={index} className={styles.commentItem}>
                  <p>“{comment}”</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#999', marginTop: '20px' }}>등록된 코멘트가 없습니다.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
