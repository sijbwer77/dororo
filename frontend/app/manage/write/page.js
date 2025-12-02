"use client";

import styles from "./write.module.css";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function NoticeWritePage() {

  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    const newNotice = {
      id: Date.now(),
      title,
      date: new Date().toISOString().slice(0, 10),
      content: content.split("\n"),
      preview: content.split("\n")[0] + "...",
    };

    const existing = JSON.parse(localStorage.getItem("notices") || "[]");
    const updated = [...existing, newNotice];
    localStorage.setItem("notices", JSON.stringify(updated));

    router.push("/manage/notice");
  };

  return (
    <div className={styles.container}>
      {/* ========== 상단 헤더 ========== */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <Image src="/doro-logo.svg" width={145} height={70} alt="로고" />
        </div>

        <div className={styles.profile}>
          <Image src="/profile-circle2.svg" width={40} height={40} alt="프로필" />
        </div>
      </div>

      <div className={styles.layout}>

        <Sidebar active="notice" />

        {/* ========== 메인 영역 ========== */}
        <main className={styles.main}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            등록하기
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

            {/* 파일 첨부 */}
            <div className={styles.row}>
              <div className={styles.label}>파일첨부</div>
              <label className={styles.fileUpload}>
                <Image src="/cloud-upload-outlined.svg" width={20} height={20} alt="업로드" />
                파일을 업로드하세요
                <input type="file" />
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
