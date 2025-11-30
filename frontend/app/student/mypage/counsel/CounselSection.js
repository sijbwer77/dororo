'use client';

import { useState } from 'react';
import styles from './counsel.module.css';

export default function CounselSection() {
  const formatTime = () =>
    new Date().toLocaleTimeString('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const today = new Date();
  const todayLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const [conversations, setConversations] = useState([
    {
      id: 'c1',
      title: '결제 관련 문의',
      status: '진행 중',
      date: '2025.10.28',
      messages: [
        { id: 'm1', from: 'me', text: '결제 오류가 자꾸 발생합니다. 확인 부탁드립니다.', ts: '오늘 10:00' },
        { id: 'm2', from: 'admin', text: '안녕하세요, DORO 매니저입니다.\n불편을 드려 죄송합니다.\n확인 후 빠르게 도와드리겠습니다.', ts: '오늘 10:02' },
        { id: 'm3', from: 'me', text: '감사합니다.', ts: '오늘 10:05' },
      ],
    },
    {
      id: 'c2',
      title: '수강 신청 관련 문의',
      status: '답변 완료',
      date: '2025.10.20',
      messages: [{ id: 'm4', from: 'admin', text: '지난 상담 내용입니다.', ts: '2025.10.20 14:00' }],
    },
  ]);
  const [selectedId, setSelectedId] = useState('c1');
  const [draft, setDraft] = useState('');
  const [contextMenuId, setContextMenuId] = useState(null);

  const selected = conversations.find((c) => c.id === selectedId);

  const deriveTitle = (text) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (/결제|카드|환불|영수증/.test(normalized)) return '결제 관련 문의';
    if (/수강\s*신청/.test(normalized)) return '수강 신청 관련 문의';
    if (/강의\s*평가/.test(normalized)) return '강의 평가 관련 문의';
    if (/강의/.test(normalized)) return '강의 관련 문의';
    if (/dimc/i.test(text)) return 'DIMC 관련 문의';
    if (/계정|로그인|비밀번호|pw|비번/.test(normalized)) return '계정/로그인 문의';
    return normalized.length > 12 ? `${normalized.slice(0, 12)}...` : normalized || '새 상담';
  };

  const sendLocalMessage = () => {
    if (!selected || selected.status !== '진행 중') return;
    const text = draft.trim();
    if (!text || !selected) return;
    const newMsg = {
      id: Date.now().toString(),
      from: 'me',
      text,
      ts: `오늘 ${formatTime().split(' ')[1]}`,
    };
    const shouldSetTitle = selected.messages.length === 0;
    const nextTitle = shouldSetTitle ? deriveTitle(text) : selected.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, messages: [...c.messages, newMsg], title: nextTitle } : c
      )
    );
    setDraft('');
  };

  const handleEndConversation = () => {
    if (!selected) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: '답변 완료' } : c))
    );
  };

  const handleNewConversation = () => {
    const newId = `new-${Date.now()}`;
    const newConv = {
      id: newId,
      title: '새 상담',
      status: '진행 중',
      date: todayLabel,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newId);
    setContextMenuId(null);
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) {
      const next = conversations.find((c) => c.id !== id);
      setSelectedId(next ? next.id : null);
    }
    setContextMenuId(null);
  };

  return (
    <section className={styles.counselLayout}>
      <div className={styles.counselListPane}>
        <div className={styles.counselHeaderRow}>
          <h2 className={styles.counselTitle}>1:1 상담 내역</h2>
          <button className={styles.counselNewBtn} onClick={handleNewConversation}>
            새 상담 요청 +
          </button>
        </div>

        <div className={styles.counselList}>
          {conversations.map((conv) => {
            const isActive = conv.id === selectedId;
            return (
              <div
                key={conv.id}
                className={`${styles.counselItem} ${isActive ? styles.counselItemActive : ''}`}
                onClick={() => {
                  setSelectedId(conv.id);
                  setContextMenuId(null);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenuId(conv.id);
                }}
              >
                <div className={styles.counselItemTop}>
                  <span className={styles.counselItemTitle}>{conv.title}</span>
                  <span
                    className={`${styles.counselStatus} ${
                      conv.status === '진행 중'
                        ? styles.statusProgress
                        : conv.status === '답변 완료'
                        ? styles.statusDone
                        : ''
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
                <div className={styles.counselItemDate}>{conv.date}</div>
                {contextMenuId === conv.id && (
                  <button
                    className={styles.counselDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.counselChatPane}>
        {selected ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitleGroup}>
                <div className={styles.chatTitleLarge}>{selected.title}</div>
                <div
                  className={`${styles.counselStatus} ${
                    selected.status === '진행 중' ? styles.statusProgress : styles.statusDone
                  }`}
                >
                  {selected.status}
                </div>
              </div>
              <button
                className={styles.chatEndBtn}
                onClick={handleEndConversation}
                disabled={selected.status !== '진행 중'}
              >
                상담 종료
              </button>
            </div>

            <div className={styles.chatWindow}>
              {selected.messages.length === 0 ? (
                <div className={styles.chatEmpty}>새 상담을 시작해 메시지를 남겨주세요.</div>
              ) : (
                selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.chatBubble} ${msg.from === 'me' ? styles.chatMine : styles.chatOther}`}
                  >
                    <span className={styles.chatText}>{msg.text}</span>
                    <span className={styles.chatTimestamp}>{msg.ts}</span>
                  </div>
                ))
              )}
            </div>

            <div className={styles.chatInputRow}>
              <input
                type="text"
                className={styles.chatInput}
                disabled={selected.status !== '진행 중'}
                placeholder="메시지 입력..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendLocalMessage();
                }}
              />
              <button className={styles.chatSendBtn} onClick={sendLocalMessage} disabled={selected.status !== '진행 중'}>
                전송
              </button>
            </div>
            <div className={styles.chatHint}>
              {selected.status === '진행 중'
                ? '* 현재는 프론트 단 로컬 메시지입니다. 백엔드 연동 후 실시간 처리 예정.'
                : '* 상담이 종료되어 입력이 비활성화되었습니다.'}
            </div>
          </>
        ) : (
          <div className={styles.chatEmpty}>상담을 선택하거나 새 상담을 생성하세요.</div>
        )}
      </div>
    </section>
  );
}
