/* app/student/course/[id]/message/page.js */
'use client';

import { useState, useEffect } from 'react';
import styles from "./message.module.css";
import Image from "next/image";
import { useParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import ReplyModal from "@/components/ReplyModal";

// ✅ API 래퍼
import {
  getCourseMessages,
  getMessageThread,
  createMessageThread,
  replyMessage,
} from "@/lib/message";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// 날짜 포맷
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

// 🔗 첨부파일 URL 빌더
function buildAttachmentInfo(raw) {
  if (!raw) return null;

  if (typeof raw === "string" && raw.startsWith("http")) {
    return {
      name: raw.split("/").pop(),
      url: raw,
    };
  }

  let path = String(raw);

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  if (!path.startsWith("/media/")) {
    path = `/media${path}`;
  }

  const url = `${BACKEND_BASE_URL}${path}`;
  return {
    name: path.split("/").pop(),
    url,
  };
}

// 목록용 매핑
function mapThreadListItemToUI(thread) {
  return {
    id: thread.id,
    sender: thread.title,
    date: thread.last_message_at ? formatKoreanDate(thread.last_message_at) : '',
    content: thread.last_message_preview || '',
    fullContent: thread.last_message_preview || '',
    conversations: [],
  };
}

// 상세용 매핑
function mapThreadDetailToUI(thread) {
  const messages = thread.messages || [];

  const conversations = [...messages].reverse().map((msg) => {
    const attachment = buildAttachmentInfo(msg.attachment);

    return {
      id: msg.id,
      role: msg.is_mine ? "나" : msg.sender_nickname,
      date: formatKoreanDate(msg.created_at),
      text: msg.content,
      profileImage: "/profile-circle.svg",
      attachment,
    };
  });

  const last = messages[messages.length - 1];

  return {
    id: thread.id,
    sender: thread.title,
    date: last ? formatKoreanDate(last.created_at) : "",
    content: last ? last.content : "",
    fullContent: last ? last.content : "",
    conversations,
  };
}

export default function MessagePage() {
  const params = useParams();
  const courseId = params.id;

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ mode: 'create', title: '' });
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 목록 불러오기
  useEffect(() => {
    if (!courseId) return;

    async function fetchList() {
      try {
        setIsLoadingList(true);
        const list = await getCourseMessages(courseId);
        const uiList = list.map(mapThreadListItemToUI);
        setMessages(uiList);
      } catch (error) {
        console.error("메시지 목록 로딩 실패:", error);
        alert("메시지 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingList(false);
      }
    }

    fetchList();
  }, [courseId]);

  // 상세 불러오기
  const handleMessageClick = async (msg) => {
    try {
      setIsLoadingDetail(true);
      const thread = await getMessageThread(msg.id);
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

  // ReplyModal onSend: (title, content, file)
  const handleSendMessage = async (title, content, file) => {
    try {
      if (modalConfig.mode === 'create') {
        // 🔹 새 스레드 생성
        const thread = await createMessageThread({
          courseId,
          title,
          content,
          attachment: file || null,
        });

        const uiDetail = mapThreadDetailToUI(thread);
        const uiListItem = mapThreadListItemToUI(thread);

        setMessages((prev) => [uiListItem, ...prev]);
        setSelectedMessage(uiDetail);
      } else if (modalConfig.mode === 'reply' && selectedMessage) {
        // 🔹 답장을 보낸 다음, 스레드 전체를 다시 조회해서 갱신
        await replyMessage({
          threadId: selectedMessage.id,
          content,
          attachment: file || null,
        });

        const thread = await getMessageThread(selectedMessage.id);
        const uiDetail = mapThreadDetailToUI(thread);
        setSelectedMessage(uiDetail);

        // 목록의 마지막 메시지 내용도 최신으로 갱신
        setMessages((prev) =>
          prev.map((item) =>
            item.id === uiDetail.id
              ? {
                  ...item,
                  content: uiDetail.content,
                  fullContent: uiDetail.fullContent,
                  date: uiDetail.date,
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
