"use client";

import Link from "next/link";
import styles from "./counsel.module.css";
import { useEffect, useState } from "react";

export default function CounselPage() {
  const [counselList, setCounselList] = useState([]);

  // -----------------------------------------
  // ① 데이터 로드: localStorage → 없으면 더미 생성
  // -----------------------------------------
  useEffect(() => {
    async function loadData() {

      // 실제 API와 연결 시 이거 사용하면 됨
      // const res = await fetch("/api/counsel", { cache: "no-store" });
      // const data = await res.json();
      // setCounselList(data);
      const raw = localStorage.getItem("counselData");

      if (raw) {
        // 🔥 저장된 상담 데이터 사용
        setCounselList(JSON.parse(raw));
      } else {
        // 🔥 처음 로딩 시 더미 데이터 생성 (isAnswered=false로 변경됨)
        const dummyData = [
          { id: 5, title: "문의1", content: "결제 오류 발생", createdAt: 110, isAnswered: false, isEnded: false },
          { id: 4, title: "문의2", content: "로그인 오류", createdAt: 108, isAnswered: false, isEnded: false },
          { id: 3, title: "문의3", content: "업로드 불가", createdAt: 105, isAnswered: false, isEnded: false },
          { id: 2, title: "문의4", content: "기타 문의", createdAt: 109, isAnswered: false, isEnded: false }
        ];

        localStorage.setItem("counselData", JSON.stringify(dummyData));
        setCounselList(dummyData);
      }
    }

    loadData();
  }, []);


  // ----------------------------------------------------
  // ② 화면에 보여줄 데이터 구성: 종료된 상담 삭제 + 정렬
  // ----------------------------------------------------
  const visibleCounsel = counselList
    .filter(item => !item.isEnded)                  // 종료된 상담 제외
    .sort((a, b) => {
      if (a.isAnswered !== b.isAnswered) {
        return a.isAnswered ? 1 : -1;               // 미답변 위로
      }
      return b.createdAt - a.createdAt;             // 최신순
    });

  // ----------------------------------------------------
  // ③ 렌더링
  // ----------------------------------------------------
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.pageTitle}>상담 문의</h2>

      <div className={styles.listBox}>
        {visibleCounsel.map(item => (
          <div key={item.id} className={styles.counselItem}>

            <div className={styles.left}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.content}>{item.content}</div>
            </div>

            {!item.isAnswered ? (
              <Link href={`/manage/counsel/${item.id}`}>
                <button className={styles.replyBtn}>답변하기</button>
              </Link>
            ) : (
              <span className={styles.doneText}>답변완료</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}