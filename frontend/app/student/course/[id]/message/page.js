/* app/student/course/[id]/message/page.js */
'use client';

import { useState } from 'react';
import styles from "./message.module.css";
import Image from "next/image";
import { useParams } from 'next/navigation';
import { FAKE_MESSAGES } from "@/data/mock-messages.js"; 
import Sidebar from "@/components/Sidebar"; 
import ReplyModal from "@/components/ReplyModal"; 

export default function MessagePage() {
  const params = useParams();
  const courseId = params.id;

  const [messages, setMessages] = useState(FAKE_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [modalConfig, setModalConfig] = useState({ mode: 'create', title: '' });

  const handleMessageClick = (msg) => {
    setSelectedMessage(msg);
  };

  const openModal = (mode, title = "") => {
    setModalConfig({ mode, title });
    setShowModal(true);
  };

  // ✅ (1) 파일 인자 추가
  const handleSendMessage = (title, content, file) => {
    
    // 파일 데이터 처리 (URL 생성)
    let attachmentData = null;
    if (file) {
      attachmentData = {
        name: file.name,
        url: URL.createObjectURL(file) // 브라우저 임시 URL
      };
    }

    if (modalConfig.mode === 'create') {
      const newMessage = {
        id: Date.now(),
        sender: title || `메시지 ${messages.length + 1}`,
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        content: content || (file ? "파일을 보냈습니다." : ""), 
        fullContent: content,
        conversations: [
          {
            id: Date.now() + 1,
            role: "나",
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
            text: content,
            profileImage: "/profile-circle.svg",
            attachment: attachmentData // ✅ 첨부파일 저장
          }
        ]
      };
      
      setMessages([newMessage, ...messages]); 
      setSelectedMessage(newMessage);
    
    } else if (modalConfig.mode === 'reply' && selectedMessage) {
      const newReply = {
        id: Date.now(),
        role: "나",
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        text: content,
        profileImage: "/profile-circle.svg",
        attachment: attachmentData // ✅ 첨부파일 저장
      };
      
      const updatedMessage = {
        ...selectedMessage,
        conversations: [newReply, ...selectedMessage.conversations]
      };
      
      setMessages(messages.map(m => m.id === selectedMessage.id ? updatedMessage : m));
      setSelectedMessage(updatedMessage); 
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        
        {showModal && (
          <ReplyModal 
            onClose={() => setShowModal(false)} 
            onSend={handleSendMessage} 
            mode={modalConfig.mode}
            defaultTitle={modalConfig.title}
          />
        )}

        {/* 메시지 목록 (기존 유지) */}
        <section className={styles.messageListSection}>
          <div className={styles.listHeader}>
            <h1 className={styles.pageTitle}>전체 메시지함</h1>
            <button className={styles.iconButton} onClick={() => openModal('create')}>
              <Image src="/sms-edit.svg" alt="New Message" width={36} height={36} />
            </button>
          </div>
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`${styles.messageItem} ${selectedMessage?.id === msg.id ? styles.selected : ''}`}
                onClick={() => handleMessageClick(msg)}
              >
                <span className={styles.msgDate}>{msg.date}</span>
                <span className={styles.msgSender}>{msg.sender}</span>
                <p className={styles.msgContent}>{msg.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 메시지 상세 (파일 표시 추가) */}
        <section className={styles.messageDetailSection}>
          {selectedMessage ? (
            <div className={styles.detailContainer}>
               <div className={styles.detailHeader}>
                 <h2 className={styles.detailTitle}>{selectedMessage.sender}</h2>
                 <button className={styles.iconButton} onClick={() => openModal('reply', selectedMessage.sender)}>
                   <Image src="/redo.svg" alt="Reply" width={25} height={24} />
                 </button>
               </div>

               <div className={styles.conversationList}>
                 {selectedMessage.conversations && selectedMessage.conversations.length > 0 ? (
                   selectedMessage.conversations.map((conv) => (
                     <div key={conv.id} className={styles.conversationItem}>
                        <div className={styles.profileImg}>
                          <Image src={conv.profileImage} alt="Profile" width={81} height={81} />
                        </div>
                        <div className={styles.bubbleContent}>
                           <div className={styles.bubbleTop}>
                              <span className={styles.senderName}>{conv.role}</span>
                              <span className={styles.sendDate}>{conv.date}</span>
                           </div>
                           <p className={styles.bubbleBody}>{conv.text}</p>
                           
                           {/* ✅ (2) 첨부파일이 있으면 다운로드 링크 표시 */}
                           {conv.attachment && (
                             <a 
                               href={conv.attachment.url} 
                               download={conv.attachment.name}
                               target="_blank"
                               rel="noopener noreferrer"
                               className={styles.attachmentLink}
                             >
                               <Image
                               src="/file-icon.svg"
                               alt="Attachment"
                               width={16}
                               height={16}
                               style={{ marginRight: '5px' }}
                               />
                                {conv.attachment.name}
                             </a>
                           )}
                        </div>
                     </div>
                   ))
                 ) : (
                   <div style={{padding: '30px', color: '#888'}}>내용이 없습니다.</div>
                 )}
               </div>
            </div>
          ) : (
            <div className={styles.emptyContainer}>
               <div className={styles.emptyIconBox}>
                 <Image src="/mail-03.svg" alt="No Message" width={111} height={111} />
               </div>
               <p className={styles.emptyText}>선택된 메시지 없음</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}