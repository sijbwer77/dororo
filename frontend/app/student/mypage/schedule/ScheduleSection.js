'use client';

import { useState, useEffect } from 'react';
import styles from './schedule.module.css';
import { apiFetch } from '@/lib/api';
import {
  fetchMySchedules,
  createMySchedule,
  updateMySchedule,
  deleteMySchedule,
} from '@/lib/schedule';

const WEEK_DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const SCHEDULE_ITEMS = [];

export default function ScheduleSection() {
  const [showPanel, setShowPanel] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [detailEvent, setDetailEvent] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const formattedDate = date ? date.split('-').join('. ') : '연도. 월. 일';

  const STATUS_CLASSNAME = {
    danger: styles.cardDanger,
    info: styles.cardInfo,
    warning: styles.cardWarning,
    purple: styles.cardPurple,
    neutral: styles.cardNeutral,
    none: styles.cardNone,
  };

  const DOT_CLASSNAME = {
    danger: styles.dotDanger,
    info: styles.dotInfo,
    warning: styles.dotWarning,
    purple: styles.dotPurple,
    neutral: styles.dotNeutral,
    none: styles.dotNone,
  };

  const mapStatusFromCourse = (courseName) => {
    if (!courseName) return 'none';
    if (courseName.includes('해커톤')) return 'neutral';
    const first = courseName.trim().charAt(0).toUpperCase();
    if (first === 'D') return 'info';
    if (first === 'I') return 'danger';
    if (first === 'M') return 'warning';
    if (first === 'C') return 'purple';
    return 'info';
  };

  // 백엔드 status + courseName 기준으로 색상 매핑
  const mapBackendStatus = (status, courseName) => {
    const s = (status || '').toLowerCase();
    if (courseName) {
      if (s === 'cancelled') return 'danger';
      if (s === 'done') return 'neutral';
      // planned/기타는 코스명 첫 글자 규칙 적용
      return mapStatusFromCourse(courseName);
    }
    // 코스명 없으면 색상 없이
    return 'none';
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const todayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(
    todayDate,
  ).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalCells = startWeekday + daysInMonth;
  const rows = Math.max(5, Math.ceil(totalCells / 7));
  const calendarCells = Array.from({ length: rows * 7 }, (_, idx) => {
    const dayNum = idx - startWeekday + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });
  const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const eventsThisMonth = userEvents.filter((e) => e.date.startsWith(currentMonthKey));
  const todayEvents = userEvents.filter((e) => e.date === todayKey);
  const eventStackCounter = {};

  // 1) 수강 중인 강의 목록 가져오기 -> 셀렉트 박스
  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiFetch('/api/student/courses/');
        setCourseOptions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('강의 목록 불러오기 실패', e);
        setCourseOptions([]);
      }
    }
    loadCourses();
  }, []);

  const loadSchedules = async () => {
    try {
      setErrorMsg('');
      const y = year;
      const m = month + 1;
      const data = await fetchMySchedules(y, m);
      const list = Array.isArray(data) ? data : data.results ?? [];

      const mapped = list.map((item) => {
        const courseObj = item.course || null;
        const courseName =
          (courseObj && (courseObj.name || courseObj.title)) ||
          item.course_title ||
          item.course_name ||
          '';

        const status = mapBackendStatus(item.status, courseName);

        return {
          id: item.id,
          date: item.date, // "YYYY-MM-DD"
          title: item.title || courseName || '',
          description: item.description || '',
          course: courseName,
          courseId:
            (courseObj && (courseObj.id || courseObj.course_id)) ||
            item.course_id ||
            null,
          type: item.type || 'personal',
          status,
        };
      });

      setUserEvents(mapped);
    } catch (e) {
      console.error('스케줄 불러오기 실패', e);
      setUserEvents([]);
      setErrorMsg('일정을 불러오지 못했습니다.');
    }
  };

  // 2) 내 스케줄(개인 + 강의일정) 가져오기
  useEffect(() => {
    loadSchedules();
  }, [year, month]);

  // 3) 일정 추가/수정
  const handlePanelSubmit = async () => {
    if (!date || !title.trim()) return;

    const baseStatus = mapStatusFromCourse(course);
    const payload = {
      date,
      title: title.trim(),
      description: description.trim(),
      course_id: selectedCourseId || null,
      course_name: selectedCourseName || course || '',
    };

    try {
      if (editingEventId) {
        await updateMySchedule(editingEventId, payload);
      } else {
        await createMySchedule(payload);
      }
      await loadSchedules();
    } catch (e) {
      console.error('일정 저장 실패', e);
      setErrorMsg('일정 저장에 실패했습니다.');
    }

    setShowPanel(false);
    setEditingEventId(null);
    setTitle('');
    setCourse('');
    setSelectedCourseId(null);
    setSelectedCourseName('');
    setDate('');
    setDescription('');
  };

  return (
    <section className={styles.schedulePageWrap}>
      <div className={styles.scheduleLayout}>
        <div className={styles.scheduleTopLine}></div>

        <div className={styles.scheduleHeader}>
          <div className={styles.dayLabelRow} aria-label="요일 표시">
            {WEEK_DAYS.map((day) => (
              <div key={day} className={styles.dayLabel}>
                {day}
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.addButton}
            aria-label="일정 추가"
            onClick={() => {
              setEditingEventId(null);
              setTitle('');
              setCourse('');
              setSelectedCourseId(null);
              setSelectedCourseName('');
              setDate('');
              setDescription('');
              setShowPanel(true);
            }}
          >
            <span className={styles.addIcon} aria-hidden />
            <span>일정 추가</span>
          </button>
        </div>

        <div className={styles.scheduleBody}>
          <div className={styles.weekShell}>
            <div
              className={styles.weekGrid}
              role="grid"
              aria-label="수업 일정"
              style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
            >
              {calendarCells.map((dayNum, idx) => {
                const col = (idx % 7) + 1;
                const row = Math.floor(idx / 7) + 1;
                const isToday = dayNum === todayDate;
                return (
                  <div
                    key={`day-${idx}`}
                    className={`${styles.dayCell} ${isToday ? styles.dayToday : ''}`}
                    style={{ gridColumn: col, gridRow: row }}
                  >
                    {dayNum && <span className={styles.dayNumber}>{dayNum}</span>}
                  </div>
                );
              })}

              {SCHEDULE_ITEMS.map((item) => (
                <div
                  key={`${item.day}-${item.slot}-${item.status}-${item.label}`}
                  className={`${styles.scheduleCard} ${STATUS_CLASSNAME[item.status]}`}
                  style={{ gridColumn: item.day + 1, gridRow: item.slot + 1 }}
                  role="gridcell"
                  aria-label={`${WEEK_DAYS[item.day]} ${item.label}`}
                >
                  <span className={`${styles.statusDot} ${DOT_CLASSNAME[item.status]}`} aria-hidden />
                  <span className={styles.cardLabel}>{item.label}</span>
                </div>
              ))}

              {eventsThisMonth.map((ev, idx) => {
                const [, , d] = ev.date.split('-').map((v) => Number(v));
                const dayNum = d;
                const cellIndex = startWeekday + dayNum - 1;
                const col = (cellIndex % 7) + 1;
                const row = Math.floor(cellIndex / 7) + 1;
              const statusClass = STATUS_CLASSNAME[ev.status] || '';
              const dotClass = DOT_CLASSNAME[ev.status] || '';
              const stackIndex = eventStackCounter[dayNum] || 0;
              eventStackCounter[dayNum] = stackIndex + 1;
              const topOffset = 32 + stackIndex * 32;
              const shortTitle =
                ev.title && ev.title.length > 7 ? `${ev.title.slice(0, 7)}...` : ev.title;
              const isTodayEvent = ev.date === todayKey;

              return (
                <div
                  key={`ev-${idx}-${ev.date}-${ev.title}`}
                  className={`${styles.scheduleCard} ${statusClass} ${styles.userEventCard} ${
                    isTodayEvent ? styles.userEventToday : ''
                  }`}
                  style={{ gridColumn: col, gridRow: row, marginTop: topOffset, zIndex: 4 }}
                  role="gridcell"
                  aria-label={`${ev.date} ${ev.title}`}
                  onClick={() => setDetailEvent(ev)}
                >
                    <span className={`${styles.statusDot} ${dotClass}`} aria-hidden />
                    <span className={styles.cardLabel}>{shortTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className={styles.todayPanel} aria-label="오늘의 일정">
            <div className={styles.todayDivider}></div>
            <div className={styles.todayHeader}>오늘의 일정</div>
            {todayEvents.length === 0 ? (
              <div className={styles.todayEmpty}>오늘 일정 없음</div>
            ) : (
              todayEvents.map((ev) => (
                <div key={`${ev.date}-${ev.title}`} className={styles.todayItem}>
                  <div className={styles.todayTitle}>{ev.title}</div>
                  {ev.course && ev.course !== '없음' && (
                    <div className={styles.todayMeta}>{ev.course}</div>
                  )}
                </div>
              ))
            )}
          </aside>
        </div>
        {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

        {showPanel && (
          <div className={styles.addPanel} role="dialog" aria-modal="true">
            <button
              type="button"
              className={styles.panelClose}
              aria-label="닫기"
              onClick={() => {
                setShowPanel(false);
                setEditingEventId(null);
                setTitle('');
                setCourse('');
                setDate('');
                setDescription('');
              }}
            />
            <div className={styles.panelRows}>
              <div className={styles.panelRow}>
                <input
                  id="schedule-title"
                  className={styles.panelTextInput}
                  placeholder="제목..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.panelRow}>
                <span className={styles.panelRowLabel}>강의(선택)</span>
                <select
                  className={styles.panelSelect}
                  value={selectedCourseId || ''}
                  onChange={(e) => {
                    const id = e.target.value || null;
                    setSelectedCourseId(id);
                    const found = courseOptions.find((c) => String(c.id) === String(id));
                    const name = found ? found.title : '';
                    setSelectedCourseName(name);
                    setCourse(name);
                  }}
                >
                  <option value="">없음</option>
                  {courseOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${styles.panelRow} ${styles.dateRow}`}>
                <span className={styles.panelRowLabel}>날짜</span>
                <input
                  type="date"
                  className={styles.panelDateInput}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="날짜 선택"
                />
              </div>

              <div className={`${styles.panelRow} ${styles.panelTextareaRow}`}>
                <textarea
                  id="schedule-desc"
                  className={styles.panelTextarea}
                  placeholder="설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.panelFooter}>
              <button
                type="button"
                className={styles.panelSubmit}
                onClick={handlePanelSubmit}
              >
                완료
              </button>
            </div>
          </div>
        )}

        {detailEvent && (
          <div className={styles.detailModal} role="dialog" aria-modal="true">
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>{detailEvent.title}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={styles.detailDelete}
                    onClick={async () => {
                      // 강의 일정(type=course)은 삭제 안 함
                      if (detailEvent.type === 'course') {
                        setDetailEvent(null);
                        return;
                      }
                      try {
                        await deleteMySchedule(detailEvent.id);
                      } catch (e) {
                        console.error('일정 삭제 실패', e);
                      }
                      setUserEvents((prev) => prev.filter((e) => e.id !== detailEvent.id));
                      setDetailEvent(null);
                    }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className={styles.detailEdit}
                    onClick={() => {
                      if (detailEvent.type === 'course') return;
                      setEditingEventId(detailEvent.id);
                      setTitle(detailEvent.title || '');
                      setCourse(detailEvent.course || '');
                      setSelectedCourseId(detailEvent.courseId || null);
                      setSelectedCourseName(detailEvent.course || '');
                      setDate(detailEvent.date || '');
                      setDescription(detailEvent.description || '');
                      setDetailEvent(null);
                      setShowPanel(true);
                    }}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className={styles.detailClose}
                    aria-label="닫기"
                    onClick={() => setDetailEvent(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>날짜</span>
                <span className={styles.detailValue}>{detailEvent.date}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>강의</span>
                <span className={styles.detailValue}>{detailEvent.course || '없음'}</span>
              </div>
              {detailEvent.description && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>내용</span>
                  <span className={styles.detailValue}>{detailEvent.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}