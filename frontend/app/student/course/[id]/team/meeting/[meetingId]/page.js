'use client';

import { useState, useRef, useEffect } from 'react';
import styles from "./meetingDetail.module.css"; 
import Image from "next/image";
import { useParams, useSearchParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar.js"; 
import { useTeamData } from "../../teamContext"; 

// 개별 블록 컴포넌트
const Block = ({ block, index, updateContent, addBlock, deleteBlock, onDragStart, onDragEnter, onDragEnd, onDragOver, isDragOver }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      contentRef.current.innerText = block.content;
    }
  }, [block.content]);

  const handleInput = (e) => {
    updateContent(block.id, e.currentTarget.innerText);
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      addBlock(index);
    }
    if (e.key === 'Backspace' && block.content === '' && index !== 0) {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  return (
    <div
      // ✅ [수정] 드래그 중인 위치(isDragOver)면 스타일 클래스 추가
      className={`${styles.blockRow} ${isDragOver ? styles.dragOverItem : ''}`}
      draggable="true" 
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className={styles.dragHandle}>:::</div>
      
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`${styles.blockContent} ${block.type === 'h2' ? styles.heading : styles.paragraph}`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()} 
      />
    </div>
  );
};


export default function MeetingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id;
  const meetingTitle = searchParams.get('title') || "제목 없음";

  const { files, chatMessages, addFile, addChatMessage } = useTeamData();
  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState(""); 
  const fileInputRef = useRef(null);

  const [blocks, setBlocks] = useState([
    { id: 1, type: 'h2', content: '오늘의 회의 목표' },
    { id: 2, type: 'p', content: '1. 아이디어 브레인스토밍' },
    { id: 3, type: 'p', content: '2. 역할 분담 정하기' },
    { id: 4, type: 'p', content: '자유롭게 의견을 나눠봅시다.' },
  ]);

  const dragItem = useRef();
  const dragOverItem = useRef();
  
  // ✅ [추가] 드래그 중 시각적 효과를 위한 State
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // --- 핸들러 ---
  const updateContent = (id, newContent) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  
  const addBlock = (index) => {
    const newBlock = { id: Date.now(), type: 'p', content: '' };
    const _blocks = [...blocks];
    _blocks.splice(index + 1, 0, newBlock);
    setBlocks(_blocks);
  };

  const deleteBlock = (id) => setBlocks(prev => prev.filter(b => b.id !== id));

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move"; 
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    // ✅ [추가] 지금 어디 위를 지나고 있는지 State 업데이트
    setDragOverIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; 
  };

  const handleSort = () => {
    // ✅ [추가] 드래그 끝나면 하이라이트 해제
    setDragOverIndex(null);

    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    
    let _blocks = [...blocks];
    const draggedBlock = _blocks[dragItem.current];
    _blocks.splice(dragItem.current, 1);
    _blocks.splice(dragOverItem.current, 0, draggedBlock);
    
    dragItem.current = null;
    dragOverItem.current = null;
    setBlocks(_blocks);
  };

  // 오른쪽 패널 핸들러
  const handleUploadClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      addFile({ id: Date.now(), name: selectedFile.name, url: objectUrl });
    }
    e.target.value = ''; 
  };
  const handleChatSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!chatInput.trim()) return;
      addChatMessage(chatInput);
      setChatInput("");
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar courseId={courseId} />
      
      <main className={styles.mainContent}>
        <section className={styles.meetingDetailSection}>
          <div className={styles.meetingHeaderBg}>
            <h1 className={styles.meetingTitle}>{meetingTitle}</h1>
          </div>
          <div className={styles.meetingStripe}></div>

          <div className={styles.meetingBody} onDragOver={handleDragOver}>
            {blocks.map((block, index) => (
              <Block
                key={block.id}
                index={index}
                block={block}
                // ✅ [추가] 현재 이 블록 위에 드래그 중인지 여부 전달
                isDragOver={dragOverIndex === index}
                
                updateContent={updateContent}
                addBlock={addBlock}
                deleteBlock={deleteBlock}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleSort}
                onDragOver={handleDragOver}
              />
            ))}
            
            <div 
                className={styles.emptyArea} 
                onClick={() => setBlocks([...blocks, { id: Date.now(), type: 'p', content: '' }])}
            >
                + 빈 공간을 클릭해 입력하세요
            </div>
          </div>
        </section>

        <section className={styles.rightPanel}>
          <div className={styles.tabButtons}>
            <button className={`${styles.tabCircle} ${styles.chatTab} ${activeTab === 'chat' ? styles.active : ''}`} onClick={() => setActiveTab('chat')}><Image src="/chat.svg" alt="Chat" width={28} height={28} /></button>
            <button className={`${styles.tabCircle} ${styles.uploadTab} ${activeTab === 'upload' ? styles.active : ''}`} onClick={() => setActiveTab('upload')}><Image src="/upload-icon.svg" alt="Upload" width={28} height={28} /></button>
          </div>
          <div className={styles.panelContent}>
            {activeTab === 'upload' && (
              <div className={styles.uploadContainer}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <div className={styles.uploadHeader} onClick={handleUploadClick} style={{ cursor: 'pointer' }}>
                   <Image src="/upload.svg" alt="Upload" width={60} height={60} />
                   <p className={styles.uploadGuideText}>파일을 업로드하세요</p>
                </div>
                <div className={styles.fileList}>
                  {files.map((file) => (
                    <a key={file.id} href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className={styles.fileItemLink}>{file.name}</a>
                  ))}
                </div>
                <div className={styles.pagination}>&lt; 1 2 3 &gt;</div>
              </div>
            )}
            {activeTab === 'chat' && (
              <div className={styles.chatContainer}>
                <div className={styles.messagesArea}>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageRow} ${msg.isMe ? styles.myMessage : styles.otherMessage}`}>
                      {!msg.isMe && <div className={styles.msgSender}>{msg.sender}</div>}
                      <div className={styles.msgBubble}>{msg.text}</div>
                      <span className={styles.msgTime}>{msg.time}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.chatInputBox}>
                   <input type="text" placeholder="Message" className={styles.chatInput} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatSubmit} />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}