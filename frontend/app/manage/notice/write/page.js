// app/admin/notice/write/page.js
"use client";

import styles from "./write.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createNotice } from "@/lib/notice";

export default function NoticeWritePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력하세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력하세요.");
      return;
    }

    try {
      setSubmitting(true);

      // 파일 업로드는 안 할 거라 title / content만 보냄
      await createNotice({
        title,
        content,
        // is_pinned: false,  // 나중에 상단 고정 기능 쓰고 싶으면 여기 붙이면 됨
      });

      alert("공지사항이 등록되었습니다.");
      router.push("/manage/notice"); // 필요하면 경로 수정
    } catch (err) {
      console.error(err);
      alert("공지 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ========== 상단 헤더 ========== */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <Image src="/doro-logo.svg" width={145} height={70} alt="로고" />
        </div>

        <div className={styles.profile}>
          <Image
            src="/profile-circle2.svg"
            width={40}
            height={40}
            alt="프로필"
          />
        </div>
      </div>

      <div className={styles.layout}>
        {/* 🔥 사이드바 제거됨 */}

        {/* ========== 메인 영역 ========== */}
        <main className={styles.main}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "등록 중..." : "등록하기"}
          </button>

          <div className={styles.formBox}>
            {/* 제목 입력 */}
            <div className={styles.row}>
              <div className={styles.label}>제목</div>
              <input
                type="text"
                className={styles.input}
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 파일 첨부 (UI만, 실제 업로드는 안 함) */}
            <div className={styles.row}>
              <div className={styles.label}>파일첨부</div>
              <label className={styles.fileUpload}>
                <Image
                  src="/cloud-upload-outlined.svg"
                  width={20}
                  height={20}
                  alt="업로드"
                />
                파일을 업로드하세요
                <input type="file" disabled />
              </label>
            </div>

            {/* 내용 */}
            <textarea
              className={styles.textarea}
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
        </main>
      </div>
    </div>
  );
}
