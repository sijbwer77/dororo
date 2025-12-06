/* app/components/ReplyModal.js */
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from "./ReplyModal.module.css";
import Image from "next/image";

export default function ReplyModal({ 
  onClose, 
  onSend, 
  mode = 'reply', 
  defaultTitle = "" 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);   // ✅ 파일 상태
  const fileInputRef = useRef(null);

  const headerText = mode === 'create' ? "새 메시지 작성" : "답변 작성";
  const placeholderText = mode === 'create'
    ? "메시지 내용을 입력하세요..."
    : "답변 내용을 입력하세요...";

  // 드래그 시작
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // 드래그 이동/종료
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position.x, position.y]);

  // ✅ 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    } else {
      setAttachedFile(null);
    }
  };

  // ✅ 보내기: title, content, 파일 3개를 모두 넘김
  const handleSendClick = async () => {
    if (!content.trim() && !attachedFile) {
      alert("내용을 입력하거나 파일을 첨부해주세요.");
      return;
    }

    try {
      await onSend(title, content, attachedFile);  // 👉 page.js의 handleSendMessage로 전달
    } finally {
      onClose(); // 모달 닫기 (page.js에서도 finally에서 한 번 더 닫지만 문제 없음)
    }
  };

  return (
    <div className={styles.modalWrapper}>
      <div
        className={styles.modalContainer}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        {/* 헤더 */}
        <div className={styles.modalHeader} onMouseDown={handleMouseDown}>
          <h2 className={styles.headerTitle}>{headerText}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <div className={styles.closeIconLine1}></div>
            <div className={styles.closeIconLine2}></div>
          </button>
        </div>

        <div className={styles.dividerBlack}></div>

        {/* 제목 영역 */}
        <div className={styles.titleArea}>
          {mode === 'create' ? (
            <input
              type="text"
              className={styles.titleInput}
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            <span className={styles.messageTitle}>{title}</span>
          )}
        </div>

        <div className={styles.dividerGray}></div>

        {/* 본문 영역 */}
        <div className={styles.bodyArea}>
          <textarea
            className={styles.replyInput}
            placeholder={placeholderText}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* 하단 영역 */}
        <div className={styles.footerArea}>
          <div className={styles.dividerGray}></div>

          <div className={styles.footerContent}>
            <span className={styles.dateText}>
              {new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>

            <div className={styles.actionBox}>
              {/* 숨겨진 파일 입력 */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* 선택된 파일명 표시 */}
                {attachedFile && (
                  <span style={{ fontSize: '14px', color: '#0A5FAE' }}>
                    📎 {attachedFile.name}
                  </span>
                )}

                <button
                  type="button"
                  className={styles.fileButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image src="/file-icon.svg" alt="파일 첨부" width={16} height={16} />
                </button>
              </div>

              <button
                type="button"
                className={styles.sendButton}
                onClick={handleSendClick}
              >
                보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
