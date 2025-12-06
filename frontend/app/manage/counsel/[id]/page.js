"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import styles from "./counselDetail.module.css";

export default function CounselDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const textareaRef = useRef(null);

  const list = JSON.parse(localStorage.getItem("counselData") || "[]");
  const current = list.find(item => item.id === Number(id));

  const [messages, setMessages] = useState([
    { from: "user", text: "결제 오류가 자꾸 발생합니다. 확인 부탁드립니다." }
  ]);
  const [reply, setReply] = useState("");

  const sendReply = () => {
    if (!reply.trim()) return;

    const newMsg = { from: "manage", text: reply };
    setMessages([...messages, newMsg]);

    const list = JSON.parse(localStorage.getItem("counselData") || "[]");
    const updatedList = list.map(item =>
      item.id === Number(id) ? { ...item, isAnswered: true } : item
    );
    localStorage.setItem("counselData", JSON.stringify(updatedList));

    setReply("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "55px";
    }
  };

  return (
    <div className={styles.detailWrapper}>

      {/* 🔹 상단 (뒤로가기 + 제목) */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => router.push("/manage/counsel")}>
          <img src="/back.svg" alt="back" className={styles.backIcon} />
        </button>
        <h2 className={styles.pageTitle}>{current?.title || "문의 제목"}</h2>
      </div>

      {/* 🔹 메시지 영역 */}
      <div className={styles.chatArea}>
        <p className={styles.meta}>학생 / ID {id}</p>

        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? styles.bubbleUser : styles.bubbleAdmin}>
            {m.text}
          </div>
        ))}
      </div>

      {/* 🔹 입력 영역 */}
      <div className={styles.inputBar}>
        <textarea
          ref={textareaRef}
          className={styles.inputBox}
          placeholder="관리자 답변을 입력하세요…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onInput={(e) => {
            const el = e.target;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
        />

        <button className={styles.sendBtn} onClick={sendReply}>
          <img src="/send-2.svg" alt="send" className={styles.sendIcon} />
        </button>
      </div>

    </div>
  );
}
