"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../team.module.css";
import Image from "next/image";

export default function UploadPanel({ groupId }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  /** 🔵 파일 목록 불러오기 */
  useEffect(() => {
    if (!groupId) return;

    async function fetchFiles() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/group/${groupId}/files/`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          console.error("파일 목록 불러오기 실패");
          return;
        }

        const data = await res.json();
        setFiles(data);
      } catch (err) {
        console.error("파일 조회 오류:", err);
      }
    }

    fetchFiles();
  }, [groupId]);

  /** 🔵 파일 업로드 */
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await fetch(
        `http://localhost:8000/api/group/${groupId}/files/`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) {
        alert("업로드 실패");
        return;
      }

      const data = await res.json();

      // 🔹 업로드된 파일을 목록에 추가 (새 파일이 위로 오게)
      setFiles((prev) => [data, ...prev]);
    } catch (err) {
      console.error("업로드 오류:", err);
    }

    e.target.value = "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploadContainer}>
      {/* 파일 input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* 업로드 버튼 */}
      <div
        className={styles.fileUploadBox}
        onClick={handleUploadClick}
        style={{ cursor: "pointer" }}
      >
        <Image src="/upload.svg" alt="Upload" width={60} height={60} />
        <p className={styles.uploadText}>파일을 업로드하세요</p>
      </div>

      {/* 파일 목록 */}
      <div className={styles.fileList}>
        {files.map((file) => (
          <a
            key={file.id}
            href={file.file_url}
            download={file.filename}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fileItem}
            style={{
              display: "block",
              textDecoration: "none",
              color: "black",
            }}
          >
            {file.filename}
          </a>
        ))}
      </div>
    </div>
  );
}
