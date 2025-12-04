'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './counsel.module.css';
import {
  closeConsultation,
  createConsultation,
  deleteConsultation,
  fetchConsultationDetail,
  fetchConsultations,
  sendConsultationMessage,
} from '@/lib/consultation';

const STATUS_LABELS = {
  IN_PROGRESS: '진행 중',
  DONE: '답변 완료',
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export default function CounselSection() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState('');
  const [contextMenuId, setContextMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const selected = useMemo(
    () => conversations.find((c) => String(c.id) === String(selectedId)),
    [conversations, selectedId]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchConsultations();
        const normalized = (data || []).map((item) => ({
          id: item.id,
          title: item.title || '새 상담',
          status: item.status || 'IN_PROGRESS',
          created_at: item.created_at,
          last_message: item.last_message,
          last_message_at: item.last_message_at,
          messages: null, // lazy load
        }));
        setConversations(normalized);
        if (normalized.length > 0) {
          setSelectedId(normalized[0].id);
        }
      } catch (err) {
        setError(err?.detail || '상담 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 상세 정보 lazy fetch
  useEffect(() => {
    const needFetch = selected && selected.messages === null;
    if (!needFetch) return;
    const loadDetail = async () => {
      try {
        const detail = await fetchConsultationDetail(selected.id);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? {
                  ...c,
                  title: detail.title || c.title,
                  status: detail.status || c.status,
                  created_at: detail.created_at || c.created_at,
                  messages: detail.messages || [],
                }
              : c
          )
        );
      } catch (err) {
        setError(err?.detail || '상담 상세를 불러오지 못했습니다.');
      }
    };
    loadDetail();
  }, [selected]);

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

  const handleSendMessage = async () => {
    if (!selected || selected.status !== 'IN_PROGRESS') return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendConsultationMessage(selected.id, text);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? {
                ...c,
                messages: [...(c.messages || []), res],
                last_message: res.text,
                last_message_at: res.created_at,
              }
            : c
        )
      );
      setDraft('');
    } catch (err) {
      setError(err?.detail || '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleEndConversation = async () => {
    if (!selected || selected.status !== 'IN_PROGRESS') return;
    try {
      const res = await closeConsultation(selected.id);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, status: res.status || 'DONE' } : c
        )
      );
    } catch (err) {
      setError(err?.detail || '상담 종료에 실패했습니다.');
    }
  };

  const handleNewConversation = async () => {
    setError(null);
    const titleInput = window.prompt('상담 제목을 입력하세요 (빈칸 가능)', '') || '';
    const firstMessage = window.prompt('첫 메시지를 입력하세요 (선택)', '') || '';
    const payload = {
      title: titleInput || (firstMessage ? deriveTitle(firstMessage) : '새 상담'),
      ...(firstMessage ? { first_message: firstMessage } : {}),
    };

    try {
      const created = await createConsultation(payload);
      const messageList =
        (created && created.messages) ||
        (firstMessage
          ? [
              {
                id: Date.now(),
                sender_type: 'student',
                text: firstMessage,
                created_at: created.created_at,
              },
            ]
          : []);
      const newConv = {
        id: created.id,
        title: created.title || payload.title || '새 상담',
        status: created.status || 'IN_PROGRESS',
        created_at: created.created_at,
        last_message: created.last_message || firstMessage || '',
        last_message_at: created.last_message_at || created.created_at,
        messages: messageList,
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedId(created.id);
      setDraft('');
      setContextMenuId(null);
    } catch (err) {
      setError(err?.detail || '새 상담 생성에 실패했습니다.');
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await deleteConsultation(id);
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (String(selectedId) === String(id)) {
          setSelectedId(next[0]?.id || null);
        }
        return next;
      });
    } catch (err) {
      setError(err?.detail || '상담 삭제에 실패했습니다.');
    }
    setContextMenuId(null);
  };

  const renderStatusChip = (status) => {
    const label = STATUS_LABELS[status] || status;
    const className =
      status === 'IN_PROGRESS'
        ? styles.statusProgress
        : status === 'DONE'
        ? styles.statusDone
        : '';
    return <span className={`${styles.counselStatus} ${className}`}>{label}</span>;
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

        {error && <div className={styles.errorBox}>{error}</div>}
        {loading && <div className={styles.loadingBox}>상담 내역을 불러오는 중...</div>}

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
                  <span className={styles.counselItemTitle}>{conv.title || '새 상담'}</span>
                  {renderStatusChip(conv.status)}
                </div>
                <div className={styles.counselItemDate}>
                  {formatDateTime(conv.last_message_at || conv.created_at)}
                </div>
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
                {renderStatusChip(selected.status)}
              </div>
              <button
                className={styles.chatEndBtn}
                onClick={handleEndConversation}
                disabled={selected.status !== 'IN_PROGRESS'}
              >
                상담 종료
              </button>
            </div>

            <div className={styles.chatWindow}>
              {selected.messages === null ? (
                <div className={styles.chatEmpty}>메시지를 불러오는 중...</div>
              ) : selected.messages.length === 0 ? (
                <div className={styles.chatEmpty}>새 상담을 시작해 메시지를 남겨주세요.</div>
              ) : (
                selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.chatBubble} ${
                      msg.sender_type === 'student' ? styles.chatMine : styles.chatOther
                    }`}
                  >
                    <span className={styles.chatText}>{msg.text}</span>
                    <span className={styles.chatTimestamp}>{formatDateTime(msg.created_at)}</span>
                  </div>
                ))
              )}
            </div>

            <div className={styles.chatInputRow}>
              <input
                type="text"
                className={styles.chatInput}
                disabled={selected.status !== 'IN_PROGRESS'}
                placeholder="메시지 입력..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button
                className={styles.chatSendBtn}
                onClick={handleSendMessage}
                disabled={selected.status !== 'IN_PROGRESS' || sending}
              >
                {sending ? '전송 중...' : '전송'}
              </button>
            </div>
            <div className={styles.chatHint}>
              {selected.status === 'IN_PROGRESS'
                ? '* 상담은 현재 진행 중입니다.'
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
