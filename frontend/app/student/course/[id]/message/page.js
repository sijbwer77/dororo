/* app/student/course/[id]/message/page.js */
'use client';

import { useState, useEffect } from 'react';
import styles from "./message.module.css";
import Image from "next/image";
import { useParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import ReplyModal from "@/components/ReplyModal";

// ✅ 새로 만든 API 래퍼 사용
import {
  getCourseMessages,
  getMessageThread,
  createMessageThread,
  replyMessage,
} from "@/lib/message";

// 날짜 포맷 유틸 (예전 new Date().toLocaleDateString('ko-KR', ...) 과 동일)
function formatKoreanDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 목록용: 백엔드 스레드 → 기존 UI에서 쓰는 message 아이템 형태로 매핑
function mapThreadListItemToUI(thread) {
  return {
    id: thread.id,
    // UI에서는 sender 라벨에 제목을 넣어서 보여주자
    sender: thread.title,
    date: thread.last_message_at ? formatKoreanDate(thread.last_message_at) : '',
    content: thread.last_message_preview || '',
    fullContent: thread.last_message_preview || '',
    // 상세 클릭하면 conversations를 채움
    conversations: [],
  };
}

// 상세용: 스레드 + messages → 기존 UI의 selectedMessage 구조로 매핑
function mapThreadDetailToUI(thread) {
  const messages = thread.messages || [];

  // 백엔드에서는 오래된 순으로 올 가능성이 있어서, 화면에서는 최신이 위로 오도록 reverse
  const conversations = [...messages].reverse().map((msg) => ({
    id: msg.id,
    role: msg.is_mine ? "나" : msg.sender_nickname,
    date: formatKoreanDate(msg.created_at),
    text: msg.content,
    profileImage: "/profile-circle.svg",
    // 첨부파일이 있으면 링크로 보여주기 (지금은 서버에 파일 업로드 로직은 아직 안 붙였다고 가정)
    attachment: msg.attachment
      ? {
          name: msg.attachment.split("/").pop(),
          // msg.attachment 가 절대경로면 그대로, 상대경로면 백엔드 주소 붙여야 함
          url: msg.attachment,
        }
      : null,
  }));

  const last = messages[messages.length - 1];

  return {
    id: thread.id,
    sender: thread.title,
    date: last ? formatKoreanDate(last.created_at) : '',
    content: last ? last.content : '',
    fullContent: last ? last.content : '',
    conversations,
  };
}

export default function MessagePage() {
  const params = useParams();
  const courseId = params.id;

  // 👉 여기서부터는 "messages = 스레드 목록" 이라고 생각하면 됨
  const [messages, setMessages] = useState([]);  // 예전 FAKE_MESSAGES 대신 API 데이터
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ mode: 'create', title: '' });
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 코스별 메시지 목록 불러오기
  useEffect(() => {
    if (!courseId) return;

    async function fetchList() {
      try {
        setIsLoadingList(true);
        const list = await getCourseMessages(courseId); // GET /api/courses/{id}/messages/
        const uiList = list.map(mapThreadListItemToUI);
        setMessages(uiList);
        // 자동 선택하고 싶으면 여기서 setSelectedMessage(...) 해도 됨
      } catch (error) {
        console.error("메시지 목록 로딩 실패:", error);
        alert("메시지 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingList(false);
      }
    }

    fetchList();
  }, [courseId]);

  // 목록에서 항목 클릭 → 상세 API 호출
  const handleMessageClick = async (msg) => {
    try {
      setIsLoadingDetail(true);
      const thread = await getMessageThread(msg.id); // GET /api/messages/{id}/
      const uiDetail = mapThreadDetailToUI(thread);
      setSelectedMessage(uiDetail);
    } catch (error) {
      console.error("메시지 상세 로딩 실패:", error);
      alert("메시지 내용을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const openModal = (mode, title = "") => {
    setModalConfig({ mode, title });
    setShowModal(true);
  };

  // ✅ ReplyModal onSend 에서 (title, content, file) 을 넘겨준다는 전제 유지
  //    - 지금은 파일 업로드는 서버에 안 보내고, 예전처럼 프론트에서만 임시 URL로 보여줌
  const handleSendMessage = async (title, content, file) => {
    // 프론트에서 보여줄 첨부파일 정보
    let attachmentData = null;
    if (file) {
      attachmentData = {
        name: file.name,
        url: URL.createObjectURL(file),
      };
    }

    try {
      if (modalConfig.mode === 'create') {
        // 🔹 새 스레드 생성: POST /api/messages/
        const thread = await createMessageThread({
          courseId,
          title,
          content,
        });

        // 상세/목록 UI 형태로 변환
        const uiDetail = mapThreadDetailToUI(thread);
        const uiListItem = mapThreadListItemToUI(thread);

        // 목록 맨 앞에 새 스레드 추가
        setMessages((prev) => [uiListItem, ...prev]);
        // 방금 만든 스레드를 상세로 선택
        setSelectedMessage(uiDetail);
      } else if (modalConfig.mode === 'reply' && selectedMessage) {
        // 🔹 답장: POST /api/messages/{id}/reply/
        const msg = await replyMessage({
          threadId: selectedMessage.id,
          content,
        });

        // UI용 새 대화 버블
        const newReply = {
          id: msg.id,
          role: "나",
          date: formatKoreanDate(msg.created_at),
          text: msg.content,
          profileImage: "/profile-circle.svg",
          attachment: attachmentData, // 파일은 일단 프론트에서만 보여줌
        };

        const updatedDetail = {
          ...selectedMessage,
          conversations: [newReply, ...(selectedMessage.conversations || [])],
        };

        setSelectedMessage(updatedDetail);

        // 목록의 마지막 메시지 내용도 최신으로 갱신
        setMessages((prev) =>
          prev.map((item) =>
            item.id === updatedDetail.id
              ? {
                  ...item,
                  content: msg.content,
                  fullContent: msg.content,
                  date: formatKoreanDate(msg.created_at),
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지를 보내는 중 오류가 발생했습니다.");
    } finally {
      setShowModal(false);
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

        {/* 메시지 목록 */}
        <section className={styles.messageListSection}>
          <div className={styles.listHeader}>
            <h1 className={styles.pageTitle}>전체 메시지함</h1>
            <button
              className={styles.iconButton}
              onClick={() => openModal('create')}
            >
              <Image src="/sms-edit.svg" alt="New Message" width={36} height={36} />
            </button>
          </div>

          {isLoadingList ? (
            <div style={{ padding: '20px', color: '#888' }}>목록 불러오는 중...</div>
          ) : (
            <div className={styles.messageList}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageItem} ${
                    selectedMessage?.id === msg.id ? styles.selected : ''
                  }`}
                  onClick={() => handleMessageClick(msg)}
                >
                  <span className={styles.msgDate}>{msg.date}</span>
                  <span className={styles.msgSender}>{msg.sender}</span>
                  <p className={styles.msgContent}>{msg.content}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <div style={{ padding: '20px', color: '#888' }}>
                  아직 메시지가 없습니다.
                </div>
              )}
            </div>
          )}
        </section>

        {/* 메시지 상세 */}
        <section className={styles.messageDetailSection}>
          {isLoadingDetail ? (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIconBox}>
                <Image src="/mail-03.svg" alt="Loading" width={111} height={111} />
              </div>
              <p className={styles.emptyText}>메시지 불러오는 중...</p>
            </div>
          ) : selectedMessage ? (
            <div className={styles.detailContainer}>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailTitle}>{selectedMessage.sender}</h2>
                <button
                  className={styles.iconButton}
                  onClick={() => openModal('reply', selectedMessage.sender)}
                >
                  <Image src="/redo.svg" alt="Reply" width={25} height={24} />
                </button>
              </div>

              <div className={styles.conversationList}>
                {selectedMessage.conversations &&
                selectedMessage.conversations.length > 0 ? (
                  selectedMessage.conversations.map((conv) => (
                    <div key={conv.id} className={styles.conversationItem}>
                      <div className={styles.profileImg}>
                        <Image
                          src={conv.profileImage}
                          alt="Profile"
                          width={81}
                          height={81}
                        />
                      </div>
                      <div className={styles.bubbleContent}>
                        <div className={styles.bubbleTop}>
                          <span className={styles.senderName}>{conv.role}</span>
                          <span className={styles.sendDate}>{conv.date}</span>
                        </div>
                        <p className={styles.bubbleBody}>{conv.text}</p>

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
                  <div style={{ padding: '30px', color: '#888' }}>
                    내용이 없습니다.
                  </div>
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
