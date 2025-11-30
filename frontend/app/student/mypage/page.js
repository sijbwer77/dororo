'use client'; 

import { useState } from 'react'; 
import styles from "./mypage.module.css";
import scheduleStyles from "./schedule.module.css";
import Image from "next/image";
import { FAKE_USER_DATA } from "@/data/mock-user.js";
import { getStageInfo } from "./stageConfig.js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TABS = [
  { text: "내 정보", key: "info" },
  { text: "My Level", key: "level" },
  { text: "1:1 상담", key: "counsel" },
  { text: "수업 일정", key: "schedule" },
];

const WEEK_DAYS = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
];

const SCHEDULE_ITEMS = [];

const STATUS_CLASSNAME = {
  danger: scheduleStyles.cardDanger,
  info: scheduleStyles.cardInfo,
  warning: scheduleStyles.cardWarning,
  purple: scheduleStyles.cardPurple,
  neutral: scheduleStyles.cardNeutral,
  none: scheduleStyles.cardNone,
};

const DOT_CLASSNAME = {
  danger: scheduleStyles.dotDanger,
  info: scheduleStyles.dotInfo,
  warning: scheduleStyles.dotWarning,
  purple: scheduleStyles.dotPurple,
  neutral: scheduleStyles.dotNeutral,
  none: scheduleStyles.dotNone,
};

function CounselView() {
  return (
    <section className={styles.counselLayout}>
      <div className={styles.counselLeft}>
        <h2 className={styles.counselTitle}>1:1 상담 내역</h2>
        <button className={styles.counselNewBtn}>새 상담 요청 +</button>
        <div className={styles.counselHeaderDivider}></div>
        <div className={styles.counselEmpty}>상담 내역 없음</div>
      </div>
      <div className={styles.counselRight}></div>
    </section>
  );
}

function MyLevelView() {
  const CURRENT_EXP = 50;
  const CURRENT_TRAIT = "D";
  const stage = getStageInfo(CURRENT_EXP, CURRENT_TRAIT);
  const showSubmarine = Boolean(stage.submarine?.src);
  const submarineClass =
    stage.submarine?.variant === "red"
      ? styles.redSubmarine
      : stage.submarine?.variant === "blue"
      ? styles.blueSubmarine
      : stage.submarine?.variant === "full"
      ? styles.fullSubmarine
      : "";

  if (stage.type === "stage2") {
    return (
      <section className={`${styles.myLevelLayout} ${styles.stageTwoLayout}`}>
        <header className={styles.myLevelHeader}>
          <h2 className={styles.stageLabel}>{stage.label}</h2>
          <Link href="/student/mypage/attendance" className={styles.attendanceBtn}>
            <Image src="/calendar-star.svg" alt="calendar" width={24} height={24} />
            <span>출결 현황 체크</span>
          </Link>
        </header>
        <div className={styles.stageDivider}></div>

        <div
          className={styles.stageTwoCanvas}
          style={
                stage.background
                  ? {
                      backgroundImage: `url(${stage.background})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center top",
                }
              : undefined
          }
        >
          <div className={styles.stageTwoBackdrop}></div>
          {stage.badges?.map((badge) => (
            <div
              key={badge.src}
              className={`${styles.stageTwoBadge} ${styles[badge.className] || ""}`}
              style={badge.offset || undefined}
            >
              <Image src={badge.src} alt="" width={badge.width} height={badge.height} />
            </div>
          ))}
        </div>

        <div className={styles.expBar}>
          <span className={styles.expLabel}>exp</span>
          <div className={styles.expTrackWrapper}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${stage.progressPercent}%` }} />
            </div>
            <Image
              src="/exp-badge.svg"
              alt="badge"
              width={117}
              height={116}
              className={styles.expBadge}
              style={{ left: `${stage.progressPercent}%` }}
            />
          </div>
          <span className={styles.expValue}>
            {stage.displayCurrent} / {stage.displayTarget}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.myLevelLayout}>
      <header className={styles.myLevelHeader}>
        <h2 className={styles.stageLabel}>{stage.label}</h2>
        <Link href="/student/mypage/attendance" className={styles.attendanceBtn}>
          <Image src="/calendar-star.svg" alt="calendar" width={24} height={24} />
          <span>출결 현황 체크</span>
        </Link>
      </header>
      <div className={styles.stageDivider}></div>

      <div className={styles.myLevelCanvas}>
        <Image src="/level-bg.svg" alt="level background" fill className={styles.canvasBg} />
        {showSubmarine && (
          <div className={styles.stageSubmarine}>
            <Image
              src={stage.submarine?.src ?? ""}
              alt="submarine"
              width={stage.submarine?.width || 156}
              height={stage.submarine?.height || 148}
              className={submarineClass}
            />
          </div>
        )}
      </div>

      <div className={styles.expBar}>
        <span className={styles.expLabel}>exp</span>
        <div className={styles.expTrackWrapper}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${stage.progressPercent}%` }} />
          </div>
          <Image 
            src="/exp-badge.svg" 
            alt="badge" 
            width={117} 
            height={116} 
            className={styles.expBadge} 
            style={{ left: `${stage.progressPercent}%` }}
          />
        </div>
        <span className={styles.expValue}>{stage.displayCurrent} / {stage.displayTarget}</span>
      </div>
    </section>
  );
}

function ScheduleView() {
  const [showPanel, setShowPanel] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [detailEvent, setDetailEvent] = useState(null);
  const formattedDate = date
    ? date.split('-').join('. ')
    : '연도. 월. 일';
  const COURSE_OPTIONS = [
    'D1/기초/1 내 손으로 만드는 무한의 계단',
    'I4/중급/2 Vrew로 손쉽게 만드는 유튜브 쇼츠',
    'M5/기초/1 여기도, 저기도 블루투스?',
    'C6/중급/2 마인크래프트, 어디까지 해봤니?',
    'DORO 해커톤',
  ];
  const YEARS = ['2024', '2025', '2026'];

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

  // 캘린더 날짜 계산 (월요일 시작)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based
  const todayDate = today.getDate();
  const todayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday=0
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

  return (
    <section className={scheduleStyles.schedulePageWrap}>
      <div className={scheduleStyles.scheduleLayout}>
        <div className={scheduleStyles.scheduleTopLine}></div>

        <div className={scheduleStyles.scheduleHeader}>
          <div className={scheduleStyles.dayLabelRow} aria-label="요일 표시">
            {WEEK_DAYS.map((day) => (
              <div key={day} className={scheduleStyles.dayLabel}>
                {day}
              </div>
            ))}
          </div>
          <button
            type="button"
            className={scheduleStyles.addButton}
            aria-label="일정 추가"
            onClick={() => {
              setEditingEventId(null);
              setTitle('');
              setCourse('');
              setDate('');
              setDescription('');
              setShowPanel(true);
            }}
          >
            <span className={scheduleStyles.addIcon} aria-hidden />
            <span>일정 추가</span>
          </button>
        </div>

        <div className={scheduleStyles.scheduleBody}>
          <div className={scheduleStyles.weekShell}>
            <div
              className={scheduleStyles.weekGrid}
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
                    className={`${scheduleStyles.dayCell} ${isToday ? scheduleStyles.dayToday : ""}`}
                    style={{ gridColumn: col, gridRow: row }}
                  >
                    {dayNum && <span className={scheduleStyles.dayNumber}>{dayNum}</span>}
                  </div>
                );
              })}

              {SCHEDULE_ITEMS.map((item) => (
                <div
                  key={`${item.day}-${item.slot}-${item.status}-${item.label}`}
                  className={`${scheduleStyles.scheduleCard} ${STATUS_CLASSNAME[item.status]}`}
                  style={{ gridColumn: item.day + 1, gridRow: item.slot + 1 }}
                  role="gridcell"
                  aria-label={`${WEEK_DAYS[item.day]} ${item.label}`}
                >
                  <span
                    className={`${scheduleStyles.statusDot} ${DOT_CLASSNAME[item.status]}`}
                    aria-hidden
                  />
                  <span className={scheduleStyles.cardLabel}>{item.label}</span>
                </div>
              ))}

              {eventsThisMonth.map((ev, idx) => {
                const [y, m, d] = ev.date.split('-').map((v) => Number(v));
                const dayNum = d;
                const cellIndex = startWeekday + dayNum - 1;
                const col = (cellIndex % 7) + 1;
                const row = Math.floor(cellIndex / 7) + 1;
                const statusClass = STATUS_CLASSNAME[ev.status] || '';
                const dotClass = DOT_CLASSNAME[ev.status] || '';
                const stackIndex = eventStackCounter[dayNum] || 0;
                eventStackCounter[dayNum] = stackIndex + 1;
                const topOffset = 32 + stackIndex * 32; // 숫자와 겹치지 않게 기본 여백 확대
                const shortTitle =
                  ev.title && ev.title.length > 7
                    ? `${ev.title.slice(0, 7)}...`
                    : ev.title;
                return (
                  <div
                    key={`ev-${idx}-${ev.date}-${ev.title}`}
                    className={`${scheduleStyles.scheduleCard} ${statusClass} ${scheduleStyles.userEventCard}`}
                    style={{ gridColumn: col, gridRow: row, marginTop: topOffset, zIndex: 4 }}
                    role="gridcell"
                    aria-label={`${ev.date} ${ev.title}`}
                    onClick={() => setDetailEvent(ev)}
                  >
                    <span className={`${scheduleStyles.statusDot} ${dotClass}`} aria-hidden />
                    <span className={scheduleStyles.cardLabel}>{shortTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className={scheduleStyles.todayPanel} aria-label="오늘의 일정">
            <div className={scheduleStyles.todayDivider}></div>
            <div className={scheduleStyles.todayHeader}>오늘의 일정</div>
            {todayEvents.length === 0 ? (
              <div className={scheduleStyles.todayEmpty}>오늘 일정 없음</div>
            ) : (
              todayEvents.map((ev) => (
                <div key={`${ev.date}-${ev.title}`} className={scheduleStyles.todayItem}>
                  <div className={scheduleStyles.todayTitle}>{ev.title}</div>
                  {ev.course && ev.course !== '없음' && (
                    <div className={scheduleStyles.todayMeta}>{ev.course}</div>
                  )}
                </div>
              ))
            )}
          </aside>
        </div>

        {showPanel && (
          <div className={scheduleStyles.addPanel} role="dialog" aria-modal="true">
            <button
              type="button"
              className={scheduleStyles.panelClose}
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
            <div className={scheduleStyles.panelRows}>
              <div className={scheduleStyles.panelRow}>
                <input
                  id="schedule-title"
                  className={scheduleStyles.panelTextInput}
                  placeholder="제목..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={scheduleStyles.panelRow}>
                <span className={scheduleStyles.panelRowLabel}>강의(선택)</span>
                <select
                  className={scheduleStyles.panelSelect}
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="">없음</option>
                  {COURSE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`${scheduleStyles.panelRow} ${scheduleStyles.dateRow}`}>
                <span className={scheduleStyles.panelRowLabel}>날짜</span>
                <input
                  type="date"
                  className={scheduleStyles.panelDateInput}
                  value={date}
                  placeholder="연도. 월. 일"
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="날짜 선택"
                />
              </div>

              <div className={`${scheduleStyles.panelRow} ${scheduleStyles.panelTextareaRow}`}>
                <textarea
                  id="schedule-desc"
                  className={scheduleStyles.panelTextarea}
                  placeholder="설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className={scheduleStyles.panelFooter}>
              <button
                type="button"
                className={scheduleStyles.panelSubmit}
                onClick={() => {
                  if (!date || !title.trim()) return;
                  const status = mapStatusFromCourse(course);
                  if (editingEventId) {
                    setUserEvents((prev) =>
                      prev.map((e) =>
                        e.id === editingEventId
                          ? { ...e, date, title, course, description, status }
                          : e
                      )
                    );
                  } else {
                    setUserEvents((prev) => [
                      ...prev,
                      { id: Date.now(), date, title, status, course, description },
                    ]);
                  }
                  setShowPanel(false);
                  setEditingEventId(null);
                  setTitle('');
                  setCourse('');
                  setDate('');
                  setDescription('');
                }}
              >
                완료
              </button>
            </div>
          </div>
        )}

        {detailEvent && (
          <div className={scheduleStyles.detailModal} role="dialog" aria-modal="true">
            <div className={scheduleStyles.detailContent}>
              <div className={scheduleStyles.detailHeader}>
                <h3 className={scheduleStyles.detailTitle}>{detailEvent.title}</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={scheduleStyles.detailDelete}
                    onClick={() => {
                      setUserEvents((prev) =>
                        prev.filter((e) => e.id !== detailEvent.id)
                      );
                      setDetailEvent(null);
                    }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className={scheduleStyles.detailEdit}
                    onClick={() => {
                      setEditingEventId(detailEvent.id);
                      setTitle(detailEvent.title || '');
                      setCourse(detailEvent.course || '');
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
                    className={scheduleStyles.detailClose}
                    aria-label="닫기"
                    onClick={() => setDetailEvent(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className={scheduleStyles.detailRow}>
                <span className={scheduleStyles.detailLabel}>날짜</span>
                <span className={scheduleStyles.detailValue}>{detailEvent.date}</span>
              </div>
              <div className={scheduleStyles.detailRow}>
                <span className={scheduleStyles.detailLabel}>강의</span>
                <span className={scheduleStyles.detailValue}>{detailEvent.course || '없음'}</span>
              </div>
              {detailEvent.description && (
                <div className={scheduleStyles.detailRow}>
                  <span className={scheduleStyles.detailLabel}>내용</span>
                  <span className={scheduleStyles.detailValue}>{detailEvent.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    ...FAKE_USER_DATA,
    profileImage: '/profile-circle.svg',
  });
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = TABS.some((t) => t.key === tabParam) ? tabParam : "info";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };
  
  if (!userData) {
    return (
      <main className={styles.mainContent}>
        <h1>로딩 중이거나 데이터를 불러오는 데 실패했습니다...</h1>
        <p>(data/mock-user.js 파일에 export const FAKE_USER_DATA가 있는지 확인하세요)</p>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      {activeTab === "info" && (
        <>
          <header className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              <Image
                src={userData.profileImage || "/profile-circle.svg"}
                alt="프로필 아이콘"
                fill
                sizes="246px"
                className={styles.profilePreview}
              />
            </div>
            {isEditing && (
              <label className={styles.uploadLabel}>
                프로필 이미지 변경
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const objectUrl = URL.createObjectURL(file);
                    setUserData((prev) => ({ ...prev, profileImage: objectUrl }));
                  }}
                />
              </label>
            )}
            <h1 className={styles.profileName}>{userData.name}</h1>
          </header>

          <section className={styles.infoSection}>
            <div className={styles.infoTitleBar}>
              <h2 className={styles.infoTitle}>개인 정보</h2>
              
              <div className={styles.pencilIcon} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? (
                  <Image
                    src="/save.svg" 
                    alt="저장"
                    width={24} 
                    height={24} 
                  />
                ) : (
                  <Image
                    src="/pencil.svg" 
                    alt="편집"
                    width={24} 
                    height={24} 
                  />
                )}
              </div>
            </div>
            <div className={styles.titleLine}></div>

            <div className={styles.infoGrid}>
              <span className={styles.infoLabel}>이름</span>
              {isEditing ? (
                <input name="name" className={styles.infoInput} value={userData.name} onChange={handleInputChange} />
              ) : (
                <span className={styles.infoValue}>{userData.name}</span>
              )}
              <div className={styles.infoLine}></div>

              <span className={styles.infoLabel}>소속</span>
              {isEditing ? (
                <input name="organization" className={styles.infoInput} value={userData.organization} onChange={handleInputChange} />
              ) : (
                <span className={styles.infoValue}>{userData.organization}</span>
              )}
              <div className={styles.infoLine}></div>

              <span className={styles.infoLabel}>ID</span>
              <span className={styles.infoValue}>{userData.username}</span>
              <div className={styles.infoLine}></div>

              <span className={styles.infoLabel}>e-mail</span>
              {isEditing ? (
                <input name="email" type="email" className={styles.infoInput} value={userData.email} onChange={handleInputChange} />
              ) : (
                <span className={styles.infoValue}>{userData.email}</span>
              )}
            </div>
            <div className={styles.bottomLine}></div>
          </section>
        </>
      )}

      {activeTab === "level" && <MyLevelView />}

      {activeTab === "counsel" && <CounselView />}

      {activeTab === "schedule" && <ScheduleView />}
    </main>
  );
}
