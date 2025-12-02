'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './attendance.module.css';
import layoutStyles from '../mypage.module.css';
import { getAttendanceMap, stampTodayAttendance } from '@/lib/gamification';

// 1~6일차 라벨만 고정 (status는 전부 API에서 온 값 사용)
const ATTENDANCE_DAYS = [
  { index: 1, label: '1일차' },
  { index: 2, label: '2일차' },
  { index: 3, label: '3일차' },
  { index: 4, label: '4일차' },
  { index: 5, label: '5일차' },
  { index: 6, label: '6일차' },
];

// 백엔드 → 프론트 status 매핑
function mapBackendStatus(val) {
  if (val === 'done' || val === 'current' || val === 'upcoming') return val;
  if (val === true || val === 'T') return 'current';
  if (val === false || val === 'F') return 'upcoming';
  return 'upcoming';
}

export default function AttendancePage() {
  // index 0~5 에 대응하는 status 배열
  const [dayStatuses, setDayStatuses] = useState(
    Array(6).fill('upcoming')
  );
  const [isLoading, setIsLoading] = useState(true);

  // === 1) 처음 들어올 때 출석 맵 불러오기 ===
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);

        const data = await getAttendanceMap(); // GET /api/gamification/attendance-map/
        if (!mounted) return;

        const daysFromApi = Array.isArray(data?.days) ? data.days : [];

        // 1) index 1~6 순서대로 status 뽑기
        const statusesByIndex = ATTENDANCE_DAYS.map((d) => {
          const found = daysFromApi.find((day) => day.index === d.index);
          return mapBackendStatus(found?.status);
        });

        // 2) 가장 처음 'done' 또는 'current'인 칸이 1일차가 되도록 회전
        //    (현재 활성화된 칸이 6일차에만 있어도 1일차로 당겨옴)
        let rotated = statusesByIndex;
        const firstActiveIdx = statusesByIndex.findIndex(
          (s) => s === 'done' || s === 'current'
        );
        if (firstActiveIdx > 0) {
          rotated = [
            ...statusesByIndex.slice(firstActiveIdx),
            ...statusesByIndex.slice(0, firstActiveIdx),
          ];
        }

        setDayStatuses(rotated);
      } catch (err) {
        console.error('attendance map error:', err);
        if (!mounted) return;

        // 백엔드 완전 터졌을 때 fallback: 1일차만 current
        const fallbackStatuses = ATTENDANCE_DAYS.map((_, idx) =>
          idx === 0 ? 'current' : 'upcoming'
        );
        setDayStatuses(fallbackStatuses);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // === 2) 도장 클릭 핸들러 ===
  const handleStampClick = async (dayIndex) => {
    const status = dayStatuses[dayIndex - 1];

    // current 상태가 아니면 클릭해도 아무 일 없음
    if (status !== 'current') return;

    try {
      const result = await stampTodayAttendance(); // POST /api/gamification/today-attendance/

      setDayStatuses((prev) => {
        const copy = [...prev];
        copy[dayIndex - 1] = 'done';
        return copy;
      });

      console.log('stampTodayAttendance result:', result);
    } catch (err) {
      const msg =
        (err && err.detail) ||
        (err && err.message) ||
        '출석 도장을 찍는 중 오류가 발생했습니다.';
      alert(msg);
    }
  };

  // === 3) 렌더링용 상태 ===
  const [s1, s2, s3, s4, s5, s6] = dayStatuses;

  const showFirstStamp = s1 === 'done' || s1 === 'current';
  const showSecondStamp = s2 === 'done' || s2 === 'current';
  const showThirdStamp = s3 === 'done' || s3 === 'current';
  const showFourthStamp = s4 === 'done' || s4 === 'current';
  const showFifthStamp = s5 === 'done' || s5 === 'current';
  const showSixthStamp = s6 === 'done' || s6 === 'current';

  const isFirstCurrent = s1 === 'current';
  const isSecondCurrent = s2 === 'current';
  const isThirdCurrent = s3 === 'current';
  const isFourthCurrent = s4 === 'current';
  const isFifthCurrent = s5 === 'current';
  const isSixthCurrent = s6 === 'current';

  return (
    <main className={`${layoutStyles.mainContent} ${styles.attendanceMain}`}>
      <div className={styles.attendanceFrame}>
        <div className={styles.topRow}>
          <Link href="/student/mypage?tab=level" className={styles.backIcon}>
            {'<<'}
          </Link>
          <h2 className={styles.pageTitle}>출석 현황</h2>
        </div>

        <div className={styles.headerDivider}></div>

        {isLoading && (
          <div className={styles.loadingText}>출석 데이터를 불러오는 중...</div>
        )}

        <div className={styles.boardWrap}>
          <Image
            src="/attendance-board.svg"
            alt="attendance board"
            width={1044}
            height={701}
            className={styles.boardImage}
          />

          {/* 1일차 */}
          {showFirstStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day1"
              width={245}
              height={220}
              className={`${styles.stamp} ${
                isFirstCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => handleStampClick(1)}
            />
          )}

          {/* 2일차 */}
          {showSecondStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day2"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay2} ${
                isSecondCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => handleStampClick(2)}
            />
          )}

          {/* 3일차 */}
          {showThirdStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day3"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay3} ${
                isThirdCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => handleStampClick(3)}
            />
          )}

          {/* 4일차 */}
          {showFourthStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day4"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay4} ${
                isFourthCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => handleStampClick(4)}
            />
          )}

          {/* 5일차 */}
          {showFifthStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day5"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay5} ${
                isFifthCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => handleStampClick(5)}
            />
          )}

          {/* 6일차 */}
          {showSixthStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day6"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay6} ${
                isSixthCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => handleStampClick(6)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
