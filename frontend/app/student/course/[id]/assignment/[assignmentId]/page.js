'use client';

import { useState, useEffect, useRef } from 'react';
import styles from "./assignmentDetail.module.css";
import Image from "next/image";
import { useParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar.js";

function getCookie(name) {
  let cookieValue = null;
  if (typeof document === "undefined") return null;

  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function AssignmentDetailPage() {
  const params = useParams();

  const courseId = params.id;
  const assignmentId = params.assignmentId;

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [submittedFile, setSubmittedFile] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  /** 🔵 1) 과제 상세 불러오기 */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/student/course/${courseId}/assignment/${assignmentId}/`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch assignment detail");

        const data = await res.json();

        setAssignment(data);
        setSubmitted(data.submitted);
        setSubmittedFile(data.submitted_file);
      } catch (err) {
        console.error("과제 상세 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [courseId, assignmentId]);

  /** 파일 선택 */
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  /** 🔴 2) 과제 제출 요청 */
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("파일을 먼저 업로드하세요!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(
        `http://localhost:8000/api/student/course/${courseId}/assignment/${assignmentId}/`,
        {
          headers: {"X-CSRFToken": getCookie("csrftoken"),},
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("제출 실패");

      alert("제출 완료되었습니다!");

      setSubmitted(true);
      setSubmittedFile(URL.createObjectURL(selectedFile)); // 임시 파일 프리뷰
    } catch (err) {
      console.error(err);
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className={styles.pageLayout}>
        <Sidebar courseId={courseId} />
        <main className={styles.mainContent}>
          <p style={{ padding: "20px" }}>불러오는 중...</p>
        </main>
      </div>
    );
  }

  if (!assignment) {
    return <div>과제를 찾을 수 없습니다. (error)</div>;
  }

  return (
    <div className={styles.pageLayout}>
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>

        {/* 🔷 상단 과제 정보 */}
        <div className={styles.topInfo}>
          <h1 className={styles.assignmentTitle}>{assignment.title}</h1>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>
              마감: {assignment.due_date?.slice(0, 16).replace("T", " ")}
            </span>
            <span className={styles.infoLabel}>제출물 유형: 파일 업로드</span>
          </div>
        </div>

        {/* 🔷 상세 박스 */}
        <div className={styles.detailBox}>

          {/* 첨부파일 */}
          {assignment.file ? (
            <a
              href={assignment.file}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fileLink}
            >
              첨부 파일 다운로드
            </a>
          ) : (
            <p className={styles.noFile}>첨부파일 없음</p>
          )}

          <p className={styles.description}>{assignment.description}</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* 🔥 제출 / 미제출 UI */}
          {submitted ? (
            <div className={styles.submittedArea}>
              <div className={styles.checkIcon}>
                <Image src="/check.svg" alt="Check" width={45} height={49} />
              </div>

              <div className={styles.submittedTextContainer}>
                <span className={styles.submittedTitle}>제출 완료</span>

                {submittedFile && (
                  <a
                    href={submittedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.submittedFile}
                  >
                    제출한 파일 보기
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.uploadArea}>
              <div className={styles.uploadBox} onClick={handleUploadClick}>
                {selectedFile ? (
                  <div className={styles.selectedFileContent}>
                    <Image src="/file-icon.svg" alt="File" width={16} height={16} />
                    <p className={styles.uploadText}>{selectedFile.name}</p>
                  </div>
                ) : (
                  <>
                    <Image src="/upload.svg" alt="Upload" width={87} height={87} />
                    <p className={styles.uploadText}>파일을 업로드하세요</p>
                  </>
                )}
              </div>

              <button className={styles.submitButton} onClick={handleSubmit}>
                과제 제출
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
