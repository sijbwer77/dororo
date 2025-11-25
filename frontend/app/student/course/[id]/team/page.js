'use client'; 

import { useState, useRef } from 'react';
import styles from "./team.module.css"; 
import Image from "next/image";
import Link from "next/link";
import { useParams} from 'next/navigation'; 
import { FAKE_TEAMS } from "@/data/mock-team.js";
import { useTeamData } from "./teamContext"; 
import Sidebar from "@/components/Sidebar"; 

export default function TeamPage() {
  const params = useParams(); 
  const courseId = params.id;
  const currentTeam = FAKE_TEAMS[0]; 

  const { files, chatMessages, addFile, addChatMessage } = useTeamData();

  const [activeTab, setActiveTab] = useState('chat');
  const [chatInput, setChatInput] = useState(""); 

  const [expandedSections, setExpandedSections] = useState({
    meeting: false, 
    research: false 
  });

  const [meetings, setMeetings] = useState([
    { id: 1, title: '1일차 회의' },
    { id: 2, title: '2일차 회의' }
  ]);
  const [researches, setResearches] = useState(['자료 1', '자료 2']);

  const fileInputRef = useRef(null);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleAddMeeting = (e) => {
    e.stopPropagation();
    const newName = prompt("추가할 회의명을 입력하세요");
    if (newName) {
      const newId = meetings.length > 0 ? meetings[meetings.length - 1].id + 1 : 1;
      setMeetings([...meetings, { id: newId, title: newName }]);
    }
  };

  const handleAddResearch = (e) => {
    e.stopPropagation();
    const newName = prompt("추가할 자료명을 입력하세요");
    if (newName) {
      setResearches([...researches, newName]);
    }
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

  return (
    <div className={styles.pageLayout}>
      
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        <section className={styles.teamListSection}>
          <div className={styles.teamListHeader}>
            <h1 className={styles.mainTitle}>팀1</h1>
          </div>
          
          <div className={styles.teamInfoBox}>
             
             {/* 1. 회의록 섹션 */}
             <div className={styles.infoRow} onClick={() => toggleSection('meeting')}>
               <span className={styles.infoIcon}>
                 <Image src="/team-note.svg" alt="Note" width={25} height={20} />
               </span>
               <span>회의록</span>
               <span className={styles.arrowIcon}>
                 {expandedSections.meeting ? (
                   <Image src="/down.svg" alt="Down" width={25} height={20} />
                 ) : (
                   <Image src="/arrow-right.svg" alt="Right" width={25} height={20} />
                 )}
               </span>
             </div>
             
             {expandedSections.meeting && (
               <div className={styles.subListContainer}>
                 {meetings.map((meeting) => (
                   <Link 
                     key={meeting.id} 
                     href={`/student/course/${courseId}/team/meeting/${meeting.id}?title=${encodeURIComponent(meeting.title)}`}
                     className={styles.subInfoRowLink}
                     // ✅ (수정됨) 아이콘과 텍스트를 가로로 정렬
                     style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                   >
                     {/* ✅ 요청하신 노트 아이콘 추가 */}
                     <Image src="/team-note.svg" alt="Note" width={25} height={20} />
                     <span>{meeting.title}</span>
                   </Link>
                 ))}
                 <button className={styles.addButton} onClick={handleAddMeeting}>+</button>
               </div>
             )}
             
             {/* 2. 자료 조사 섹션 */}
             <div 
               className={styles.infoRow} 
               style={{marginTop: '20px'}}
               onClick={() => toggleSection('research')}
             >
               <span className={styles.infoIcon}>
                 <Image src="/team-note.svg" alt="Note" width={25} height={20} />
               </span>
               <span>자료 조사</span>
               <span className={styles.arrowIcon}>
                 {expandedSections.research ? (
                   <Image src="/down.svg" alt="Down" width={25} height={20} />
                 ) : (
                   <Image src="/arrow-right.svg" alt="Right" width={25} height={20} />
                 )}
               </span>
             </div>

             {expandedSections.research && (
               <div className={styles.subListContainer}>
                  {researches.map((res, index) => (
                    <div key={index} className={styles.subInfoRow}>{res}</div>
                  ))}
                  <button className={styles.addButton} onClick={handleAddResearch}>+</button>
               </div>
             )}

          </div>
        </section>

        <section className={styles.teamWorkSection}>
          <div className={styles.tabButtons}>
            <button className={`${styles.tabButton} ${activeTab === 'chat' ? styles.activeTab : ''}`} onClick={() => setActiveTab('chat')}><Image src="/chat.svg" alt="Chat" width={28} height={28} /></button>
            <button className={`${styles.tabButton} ${activeTab === 'upload' ? styles.activeTab : ''}`} onClick={() => setActiveTab('upload')}><Image src="/upload-icon.svg" alt="Upload" width={28} height={28} /></button>
          </div>

          <div className={styles.workContent}>
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
                   <input type="text" placeholder="Message" className={styles.chatInput} value={chatInput} onChange={(e)=>setChatInput(e.target.value)} onKeyDown={handleChatSubmit} />
                </div>
              </div>
            )}
            
            {activeTab === 'upload' && (
              <div className={styles.uploadContainer}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                <div className={styles.fileUploadBox} onClick={handleUploadClick} style={{ cursor: 'pointer' }}>
                   <Image src="/upload.svg" alt="Upload" width={60} height={60} />
                   <p className={styles.uploadText}>파일을 업로드하세요</p>
                </div>
                <div className={styles.fileList}>
                  {files.map((file) => (
                    <a key={file.id} href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className={styles.fileItem} style={{display:'block', textDecoration:'none', color:'black'}}>
                       {file.name}
                    </a>
                  ))}
                </div>
                <div className={styles.pagination}>&lt; 1 2 3 &gt;</div>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}