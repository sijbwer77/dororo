"use client";

"use client";

import Link from "next/link";
import styles from "./counsel.module.css";
import { useEffect, useState } from "react";
import { fetchConsultations } from "@/lib/consultation";

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

export default function CounselPage() {
  const [counselList, setCounselList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchConsultations();
        const normalized = (data || []).map((c) => ({
          id: c.id,
          title: c.title || "무제",
          status: c.status,
          last_message: c.last_message,
          last_message_at: c.last_message_at || c.created_at,
          last_message_sender_type: c.last_message_sender_type,
          created_at: c.created_at,
        }));
        setCounselList(normalized);
      } catch (err) {
        setError(err?.detail || "상담 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 폴링: 목록 갱신 (새 메시지/상태 반영)
  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const data = await fetchConsultations();
        const normalized = (data || []).map((c) => ({
          id: c.id,
          title: c.title || "무제",
          status: c.status,
          last_message: c.last_message,
          last_message_at: c.last_message_at || c.created_at,
          last_message_sender_type: c.last_message_sender_type,
          created_at: c.created_at,
        }));
        setCounselList(normalized);
      } catch {
        // ignore
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const visibleCounsel = counselList
    .filter((c) => c.status !== "DONE") // 학생이 상담 종료하면 목록에서 제외
    .sort((a, b) => {
      const aTime = a.last_message_at || a.created_at;
      const bTime = b.last_message_at || b.created_at;
      return new Date(bTime) - new Date(aTime);
    });

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.pageTitle}>상담 문의</h2>
      {error && <div className={styles.errorBox}>{error}</div>}
      {loading && <div className={styles.loadingBox}>불러오는 중...</div>}

      <div className={styles.listBox}>
        {visibleCounsel.map((item) => (
          <div key={item.id} className={styles.counselItem}>
            <div className={styles.left}>
              <div className={styles.title}>{item.title}</div>
              <div className={styles.content}>
                {item.last_message || "최근 메시지가 없습니다."}
              </div>
              <div className={styles.dateText}>
                {formatDateTime(item.last_message_at || item.created_at)}
              </div>
            </div>

            {item.last_message_sender_type === "admin" ? (
              <span className={styles.doneText}>답변완료</span>
            ) : (
              <Link href={`/manage/counsel/${item.id}`}>
                <button className={styles.replyBtn}>대화 보기</button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
