// app/manager/messages/page.js
'use client';

import { useState } from 'react';
import {
  getCourseMessages,
  getMessageThread,
  replyMessage,
} from '@/lib/message';

export default function ManagerMessagesPage() {
  const [courseId, setCourseId] = useState('');
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadThreads = async () => {
    if (!courseId) {
      alert('courseId를 입력하세요.');
      return;
    }
    try {
      setLoadingList(true);
      const data = await getCourseMessages(courseId);
      setThreads(data);
      setSelectedThread(null);
    } catch (e) {
      console.error(e);
      alert('스레드 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingList(false);
    }
  };

  const openThread = async (threadId) => {
    try {
      setLoadingDetail(true);
      const data = await getMessageThread(threadId);
      setSelectedThread(data);
      setReplyText('');
    } catch (e) {
      console.error(e);
      alert('스레드 내용을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const sendReply = async () => {
    if (!selectedThread || !replyText.trim()) return;
    try {
      await replyMessage({
        threadId: selectedThread.id,
        content: replyText,
      });
      // 다시 상세 로딩해서 최신 상태 보기
      const updated = await getMessageThread(selectedThread.id);
      setSelectedThread(updated);
      setReplyText('');
    } catch (e) {
      console.error(e);
      alert('답장 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 왼쪽: 코스 선택 + 스레드 목록 */}
      <div style={{ width: '40%' }}>
        <h1>매니저용 메시지 확인 페이지</h1>

        <div style={{ marginBottom: '16px', border: '1px solid #ccc', padding: '12px' }}>
          <label>
            코스 ID:&nbsp;
            <input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              style={{ width: '120px' }}
            />
          </label>
          <button onClick={loadThreads} style={{ marginLeft: '8px' }}>
            불러오기
          </button>
        </div>

        {loadingList ? (
          <p>목록 불러오는 중...</p>
        ) : (
          <table
            border="1"
            cellPadding="6"
            cellSpacing="0"
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>미확인</th>
                <th>최근 메시지</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((t) => (
                <tr key={t.id} onClick={() => openThread(t.id)} style={{ cursor: 'pointer' }}>
                  <td>{t.id}</td>
                  <td>{t.title}</td>
                  <td>{t.unread_count}</td>
                  <td>{t.last_message_preview}</td>
                </tr>
              ))}
              {threads.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#666' }}>
                    스레드 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 오른쪽: 스레드 상세 + 답장 */}
      <div style={{ width: '60%' }}>
        <h2>스레드 상세</h2>
        {loadingDetail && <p>내용 불러오는 중...</p>}

        {!loadingDetail && !selectedThread && (
          <p style={{ color: '#666' }}>왼쪽에서 스레드를 선택하세요.</p>
        )}

        {!loadingDetail && selectedThread && (
          <div>
            <h3>
              #{selectedThread.id} / {selectedThread.title}
            </h3>
            <p>
              코스 ID: {selectedThread.course} / 코스명: {selectedThread.course_title}
            </p>
            <hr />

            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                padding: '8px',
                marginBottom: '12px',
              }}
            >
              {selectedThread.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: '10px',
                    padding: '6px',
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#555' }}>
                    <b>{m.sender_nickname}</b> ({m.is_mine ? '나' : '상대'})
                    &nbsp;|&nbsp; {new Date(m.created_at).toLocaleString('ko-KR')}
                  </div>
                  <div>{m.content}</div>
                </div>
              ))}
            </div>

            <div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="답장 내용을 입력하세요"
              />
              <button onClick={sendReply} style={{ marginTop: '8px' }}>
                답장 보내기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}