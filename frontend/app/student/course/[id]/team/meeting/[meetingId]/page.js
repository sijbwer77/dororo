'use client';

import { useState, useRef } from 'react';
import styles from "./meetingDetail.module.css";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
//import { FAKE_COURSES } from "@/data/mock-courses.js";
import Sidebar from "@/components/Sidebar.js";
import { useTeamData } from "../../teamContext"; 

export default function MeetingDetailPage() {
  const params = useParams();
  //const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id;
  const meetingId = params.meetingId;
  const meetingTitle = searchParams.get('title') || `${meetingId}일차 회의`;
  //const course = FAKE_COURSES.find(c => c.id == Number(courseId));
  //const courseName = course ? course.title : "과목 상세";

  const { files, chatMessages, addFile, addChatMessage } = useTeamData();

  const [activeTab, setActiveTab] = useState('upload');
  const [chatInput, setChatInput] = useState(""); 

  const [contents, setContents] = useState([
    { id: 1, type: 'title', text: '회의 목표' },
    { id: 2, type: 'body', text: '싸우지 않기 행복하기 목표 달성하기' },
  ]);

  const fileInputRef = useRef(null);

  const handleAddContent = () => {
    const newText = prompt("추가할 내용을 입력하세요");
    if (newText) setContents([...contents, { id: Date.now(), type: 'body', text: newText }]);
  };

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

  /*const courseSidebarMenus = [
    { text: "공지", href: `/student/course/${courseId}` }, 
    { text: "주차학습", href: `/student/course/${courseId}/learning` },
    { text: "과제", href: `/student/course/${courseId}/assignment` },
    { text: "팀", href: `/student/course/${courseId}/team`, active: true }, 
    { text: "메시지", href: "#" },
  ];*/

  return (
    <div className={styles.pageLayout}>

      <Sidebar courseId={courseId} />
      
  
      <main className={styles.mainContent}>
        <section className={styles.meetingDetailSection}>
          <div className={styles.meetingHeaderBg}><h1 className={styles.meetingTitle}>{meetingTitle}</h1></div>
          <div className={styles.meetingStripe}></div>
          <div className={styles.meetingBody}>
             {contents.map((item) => (item.type === 'title' ? <h3 key={item.id} className={styles.subTitle}>{item.text}</h3> : <p key={item.id} className={styles.contentBody}>{item.text}</p>))}
             <div className={styles.plusArea}><span className={styles.plusText} onClick={handleAddContent}>+</span></div>
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
                   <div className={styles.uploadHeader} onClick={handleUploadClick}>
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