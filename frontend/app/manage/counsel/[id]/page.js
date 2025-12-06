"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./counselDetail.module.css";
import {
  fetchConsultationDetail,
  sendConsultationMessage,
} from "@/lib/consultation";

const formatDateTime = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function CounselDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const textareaRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchConsultationDetail(id);
        setDetail(data);
      } catch (err) {
        setError(err?.detail || "상담을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendConsultationMessage(id, reply);
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), res],
        };
      });
      setReply("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "55px";
      }
    } catch (err) {
      setError(err?.detail || "메시지를 전송하지 못했습니다.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => router.push("/manage/counsel")}>
          <img src="/back.svg" alt="back" className={styles.backIcon} />
        </button>
        <h2 className={styles.pageTitle}>{detail?.title || "문의 제목"}</h2>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}
      {loading && <div className={styles.loadingBox}>불러오는 중...</div>}

      <div className={styles.chatArea}>
        <p className={styles.meta}>학생 / ID {id}</p>

        {(detail?.messages || []).map((m) => (
          <div
            key={m.id}
            className={m.sender_type === "student" ? styles.bubbleUser : styles.bubbleAdmin}
          >
            <div className={styles.msgText}>{m.text}</div>
            <div className={styles.msgMeta}>{formatDateTime(m.created_at)}</div>
          </div>
        ))}
      </div>

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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendReply();
            }
          }}
        />

        <button className={styles.sendBtn} onClick={sendReply} disabled={sending}>
          <img src="/send-2.svg" alt="send" className={styles.sendIcon} />
        </button>
      </div>
    </div>
  );
}
