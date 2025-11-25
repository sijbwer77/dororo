'use client';

import { useState, useEffect, useRef } from 'react';
import styles from "./assignmentDetail.module.css";
import Image from "next/image";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { FAKE_ASSIGNMENTS } from "@/data/mock-assignments.js"; 
import Sidebar from "@/components/Sidebar.js";

export default function AssignmentDetailPage() {
  const params = useParams();
  
  const courseId = params.id;
  const assignmentId = Number(params.assignmentId);

  // 1. 현재 과제 데이터 찾기
  const initialAssignment = FAKE_ASSIGNMENTS.find(a => a.id === assignmentId);

  // 2. '제출 상태'를 관리하는 State (기본값: 데이터의 isSubmitted 값)
  // (주의: 실제 앱에서는 서버에서 받아와야 하지만, 여기선 로컬 state로 흉내냅니다)
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // (중요!) 페이지가 처음 로드될 때, 데이터의 초기 상태를 state에 반영
  useEffect(() => {
    if (initialAssignment) {
      setIsSubmitted(initialAssignment.isSubmitted);
    }
  }, [initialAssignment]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setSelectedFile(file);
    }
  }


  // 3. '과제 제출' 버튼 핸들러
  const handleSubmit = () => {
    setIsSubmitted(true);
    alert("과제가 제출되었습니다!");
  };

  const getSubmittedFileUrl = () => {
    if (selectedFile) {
      // 방금 업로드한 파일인 경우: 브라우저 임시 URL 생성
      return URL.createObjectURL(selectedFile);
    }
    // 기존에 제출된 파일인 경우: 데이터에 URL이 있다면 사용 (없으면 #)
    return initialAssignment.fileUrl || "#";
  };

  const submittedFileName = selectedFile 
    ? selectedFile.name 
    : (initialAssignment.submittedFile || "파일.pdf");

  // 4. 이전/다음 과제 찾기
  const currentIndex = FAKE_ASSIGNMENTS.findIndex(a => a.id === assignmentId);
  const prevAssignment = FAKE_ASSIGNMENTS[currentIndex + 1]; 
  const nextAssignment = FAKE_ASSIGNMENTS[currentIndex - 1]; 


  if (!initialAssignment) return <div>과제를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.pageLayout}>
      
      {/* 사이드바 (공통) */}
      <Sidebar courseId={courseId} />

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        
        {/* 상단 정보 */}
        <div className={styles.topInfo}>
          <h1 className={styles.assignmentTitle}>{initialAssignment.title}</h1>
          <div className={styles.infoRow}>
             <span className={styles.infoLabel}>마감 {initialAssignment.deadline}</span>
             <span className={styles.infoLabel}>제출물 유형 파일 업로드</span>
          </div>
        </div>

        {/* 과제 상세 박스 */}
        <div className={styles.detailBox}>
          
          {/* (수정!) 파일 첨부 링크 (클릭 시 열림) */}
          <a 
            href={initialAssignment.fileUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.fileLink}
          >
            {initialAssignment.fileName || "첨부파일 없음"}
          </a>

          <p className={styles.description}>
            {initialAssignment.description}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} // 화면에는 안 보이게 숨김
          />

          {isSubmitted ? (
            // [제출 완료 상태]
            <div className={styles.submittedArea}>
               <div className={styles.checkIcon}>
                 <Image src="/check.svg" alt="Check" width={45} height={49} />
               </div>
               <div className={styles.submittedTextContainer}>
                  <span className={styles.submittedTitle}>제출 완료</span>
                  <a 
                    href={getSubmittedFileUrl()} 
                    download={submittedFileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.submittedFile}
                  >
                    {submittedFileName}
                  </a>
               </div>
            </div>
          ) : (
            // [미제출 상태]
            <div className={styles.uploadArea}>
               {/* (7. 수정!) 업로드 박스에 클릭 이벤트 추가 */}
               <div className={styles.uploadBox} onClick={handleUploadClick}>
                  {/* 파일이 선택되었으면 파일명 보여주기 */}
                  {selectedFile ? (
                    <div className={styles.selectedFileContent}>
                      <Image 
                      src="/file-icon.svg" 
                      alt="File" 
                      width={16} 
                      height={16}
                      />
                      <p className={styles.uploadText}>{selectedFile.name}</p>
                      <span className={styles.reUploadText}></span>
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

        {/* 하단 네비게이션 */}
        <div className={styles.navigationBar}>
          
          {prevAssignment ? (
            <Link href={`/student/course/${courseId}/assignment/${prevAssignment.id}`} className={styles.navButton}>
              <Image src="/left.svg" alt="Next" width={13} height={13} />
              <span className={styles.navButtonText}>이전</span>
            </Link>
          ) : (
            <div /> 
          )}

          {nextAssignment ? (
            <Link href={`/student/course/${courseId}/assignment/${nextAssignment.id}`} className={styles.navButton}>
              <span className={styles.navButtonText}>다음</span>
              <Image src="/right.svg" alt="Next" width={13} height={13} />
            </Link>
          ) : (
            <div />
          )}
          
        </div>

      </main>
    </div>
  );
}