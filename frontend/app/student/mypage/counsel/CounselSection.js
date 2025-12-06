'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './counsel.module.css';
import {
  closeConsultation,
  createConsultation,
  deleteConsultation,
  fetchConsultationDetail,
  fetchConsultations,
  fetchConsultationSuggestion,
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
          suggestion: null,
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
        if (detail.messages && detail.messages.length > 0) {
          try {
            const sug = await fetchConsultationSuggestion(selected.id);
            setConversations((prev) =>
              prev.map((c) =>
                c.id === selected.id ? { ...c, suggestion: sug } : c
              )
            );
          } catch {
            // ignore suggestion failure
          }
        }
      } catch (err) {
        setError(err?.detail || '상담 상세를 불러오지 못했습니다.');
      }
    };
    loadDetail();
  }, [selected]);

  const deriveTitle = (text) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();

    const rules = [
      {
        title: '결제 관련 문의',
        keywords: [
          '결제', '결재', '카드', '승인', '출금', '이체', '간편결제', '계좌이체',
          '안 돼', '안되', '오류', '실패', '이중', '두 번', '중복', '막혔', '한도',
          '결제가 안 돼', '결제가 안되', '결제 오류', '결제 실패',
          '이중 결제', '두 번 결제', '중복 결제',
          '승인이 안나', '카드가 막혔',
        ],
      },
      {
        title: '환불/취소 문의',
        keywords: [
          '환불', '취소', '취소해', '취소요', '결제 취소', '환불해주세요', '돈 돌려',
          '승인 취소', '입금 취소', '취소가 안 돼', '취소가 안되', '철회',
        ],
      },
      {
        title: '정기결제/구독 문의',
        keywords: [
          '정기결제', '자동결제', '정기 결제', '자동 결제', '구독료', '매달 결제', '자동으로 결제',
          '구독', '구독 취소', '정기결제 해지', '구독 해지', '자동결제 멈춰', '구독 해제', '구독 중단',
        ],
      },
      {
        title: '로그인/계정 문의',
        keywords: [
          '로그인', '접속이 안 돼', '접속이 안되', '로그인이 안돼', '접속 오류',
          '아이디', '계정', '비밀번호', '비번', '인증번호', '본인인증',
          '잠겼', '잠김', '로그아웃', '자동 로그인', '2fa', 'otp',
        ],
      },
      {
        title: '회원정보/개인정보 문의',
        keywords: [
          '이름 변경', '휴대폰 번호', '전화번호', '주소 변경', '이메일 변경',
          '회원 정보', '개인정보', '탈퇴', '회원탈퇴', '계정 삭제',
        ],
      },
      {
        title: '이용 방법 문의',
        keywords: [
          '어떻게 쓰', '어떻게 이용', '사용법', '이용 방법',
          '어디서 보나요', '어디에서 확인', '설정하는 법', '기능이 뭐예요', '메뉴가 어디',
        ],
      },
      {
        title: '오류/장애 문의',
        keywords: [
          '오류', '에러', '버그', '장애', '멈춰요', '튕겨요', '강제 종료',
          '화면이 안 떠', '로딩만', '깨져 보', '페이지가 안 열려',
          '서버 에러', '500', '404',
        ],
      },
      {
        title: '이벤트/쿠폰/포인트 문의',
        keywords: [
          '이벤트', '프로모션', '응모', '당첨',
          '쿠폰', '할인 코드', '할인코드', '할인쿠폰', '적용이 안 돼', '적용이 안되',
          '포인트', '마일리지', '적립금', '리워드',
        ],
      },
      {
        title: '배송 문의',
        keywords: [
          '배송', '발송', '택배', '운송장', '송장', '배송이 안 와', '배송이 안와', '언제 오나요',
          '배송 상태', '배송지 변경', '수령지 변경',
        ],
      },
      {
        title: '수업 내용 문의',
        keywords: [
          '수업 내용', '강의 내용', '강의가 이해가 안', '이해가 안 돼', '이해가 안되',
          '진도가 어디까지', '어디까지 했나요', '다음 시간에 뭐 해요',
          '설명 다시', '예시 더', '개념이 헷갈려',
        ],
      },
      {
        title: '과제/리포트 문의',
        keywords: [
          '과제', '레포트', '리포트', '숙제',
          '과제 제출', '제출 기한', '마감 언제', '마감 시간',
          '양식', '분량', '형식', '파일 형식', '표지', '텍스트 양식',
        ],
      },
      {
        title: '시험/퀴즈 문의',
        keywords: [
          '시험', '중간고사', '기말고사', '퀴즈',
          '시험 범위', '시험 날짜', '시험 시간', '시험 방식',
          '오픈북', '시험 재응시', '재시험', '시험 난이도',
        ],
      },
      {
        title: '성적/출석 문의',
        keywords: [
          '성적', '점수', '평가', '채점',
          '출석', '지각', '결석', '출결',
          '성적 정정', '점수 정정', '성적이 이상', '점수가 이상',
        ],
      },
      {
        title: '수강신청/분반 문의',
        keywords: [
          '수강 신청', '수강신청', '신청이 안 돼', '신청이 안되', '신청 오류',
          '분반', '반 변경', '다른 반', '다른 시간대',
          '시간표', '시간이 겹쳐', '중복 수강',
        ],
      },
      {
        title: '강의자료/녹화본 문의',
        keywords: [
          '강의 자료', '수업 자료', 'ppt', '슬라이드', '자료가 안 떠', '자료가 안떠',
          '녹화본', '강의 영상', '다시보기', 'vod', '업로드 안 됨', '업로드 안됨', '업로드 안돼',
          'lms', 'e-class', '온라인 강의실', '플랫폼 접속', '강의실',
        ],
      },
      {
        title: '조별과제/팀프로젝트 문의',
        keywords: [
          '조별과제', '팀플', '팀 프로젝트', '프로젝트', '팀',
          '조 편성', '팀 배정', '팀원', '팀원이 안 나와', '팀원이 안나와', '팀원 연락',
          '발표', '발표 순서', '발표 기준', '발표 평가',
        ],
      },
      {
        title: '진로/학습 상담',
        keywords: [
          '진로', '진학', '취업', '전공 선택',
          '어떤 과목을 들어야', '수업 추천', '이수 체계', '필수 과목', '선택 과목',
          '탐구 방향', '연구 주제',
        ],
      },
    ];

    for (const rule of rules) {
      if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        return rule.title;
      }
    }

    if (!normalized) return '새 상담';
    return normalized.length > 8 ? `${normalized.slice(0, 8)}...` : normalized;
  };

  const handleSendMessage = async () => {
    if (!selected || selected.status !== 'IN_PROGRESS') return;
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    setError(null);

    const derivedTitle = deriveTitle(text);

    // temp 상담이면 첫 메시지 보낼 때 생성 + 제목 결정
    if (selected.isTemp) {
      try {
        const created = await createConsultation({
          title: derivedTitle,
          first_message: text,
        });

        const messagesFromApi = created.messages || [];
        const fallbackMessage = {
          id: Date.now(),
          sender_type: 'student',
          text,
          created_at: created.created_at,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selected.id
              ? {
                  id: created.id,
                  title: derivedTitle,
                  status: created.status || 'IN_PROGRESS',
                  created_at: created.created_at,
                  last_message: created.last_message || messagesFromApi[0]?.text || text,
                  last_message_at: created.last_message_at || messagesFromApi[0]?.created_at || created.created_at,
                  messages: messagesFromApi.length ? messagesFromApi : [fallbackMessage],
                  suggestion: created.suggestion || null,
                  isTemp: false,
                }
              : c
          )
        );
        setSelectedId(created.id);
        setDraft('');
      } catch (err) {
        setError(err?.detail || '새 상담 생성에 실패했습니다.');
      } finally {
        setSending(false);
      }
      return;
    }

    // 기존 상담에 메시지 추가 (첫 메시지라면 제목도 갱신)
    try {
      const res = await sendConsultationMessage(selected.id, text);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? (() => {
                const isFirstMsg = !c.messages || c.messages.length === 0;
                const shouldUpdateTitle = isFirstMsg && (!c.title || c.title === '새 상담');
                return {
                  ...c,
                  title: shouldUpdateTitle ? derivedTitle : c.title,
                  messages: [...(c.messages || []), res],
                  last_message: res.text,
                  last_message_at: res.created_at,
                  suggestion: res.suggestion || c.suggestion || null,
                };
              })()
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

  const handleNewConversation = () => {
    setError(null);
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newConv = {
      id: tempId,
      isTemp: true,
      title: '새 상담',
      status: 'IN_PROGRESS',
      created_at: nowIso,
      last_message: '',
      last_message_at: nowIso,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(tempId);
    setDraft('');
    setContextMenuId(null);
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
            {selected.suggestion?.message && (
              <div className={styles.suggestionBox}>
                <div className={styles.suggestionTitle}>
                  상담사 답변{selected.suggestion.category ? ` · ${selected.suggestion.category}` : ''}
                </div>
                <div className={styles.suggestionText}>{selected.suggestion.message}</div>
                <div className={styles.suggestionFooter}>
                  이 답변으로 해결되셨나요? 추가로 필요한 부분을 남겨주시면 바로 도와드릴게요.
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.chatEmpty}>상담을 선택하거나 새 상담을 생성하세요.</div>
        )}
      </div>
    </section>
  );
}
