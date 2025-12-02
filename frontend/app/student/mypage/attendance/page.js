'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './attendance.module.css';
import layoutStyles from '../mypage.module.css';

// status can be 'done' | 'current' | 'upcoming' | boolean
const ATTENDANCE_STEPS = [
  { label: '1일차', status: 'done' },
  { label: '2일차', status: 'done' },
  { label: '3일차', status: 'done' },
  { label: '4일차', status: 'current' },
  { label: '5일차', status: 'upcoming' },
  { label: '6일차', status: 'upcoming' },
];

export default function AttendancePage() {
  const [firstDayStatus, setFirstDayStatus] = useState(null);
  const [secondDayStatus, setSecondDayStatus] = useState(null);
  const [thirdDayStatus, setThirdDayStatus] = useState(null);
  const [fourthDayStatus, setFourthDayStatus] = useState(null);
  const [fifthDayStatus, setFifthDayStatus] = useState(null);
  const [sixthDayStatus, setSixthDayStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapBackendStatus = (val) => {
    if (val === true || val === 'T') return 'current'; // 진행 중
    if (val === false || val === 'F') return 'upcoming'; // 예정
    if (val === 'done' || val === 'current' || val === 'upcoming') return val;
    return 'upcoming';
  };

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/attendance/status');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!mounted) return;
        const raw = data?.firstDayStatus ?? data?.first ?? ATTENDANCE_STEPS[0].status;
        const rawSecond =
          data?.secondDayStatus ??
          data?.second ??
          data?.day2 ??
          ATTENDANCE_STEPS[1].status;
        const rawThird =
          data?.thirdDayStatus ??
          data?.third ??
          data?.day3 ??
          ATTENDANCE_STEPS[2].status;
        const rawFourth =
          data?.fourthDayStatus ??
          data?.fourth ??
          data?.day4 ??
          ATTENDANCE_STEPS[3].status;
        const rawFifth =
          data?.fifthDayStatus ??
          data?.fifth ??
          data?.day5 ??
          ATTENDANCE_STEPS[4].status;
        const rawSixth =
          data?.sixthDayStatus ??
          data?.sixth ??
          data?.day6 ??
          ATTENDANCE_STEPS[5].status;
        setFirstDayStatus(mapBackendStatus(raw));
        setSecondDayStatus(mapBackendStatus(rawSecond));
        setThirdDayStatus(mapBackendStatus(rawThird));
        setFourthDayStatus(mapBackendStatus(rawFourth));
        setFifthDayStatus(mapBackendStatus(rawFifth));
        setSixthDayStatus(mapBackendStatus(rawSixth));
      } catch (e) {
        if (!mounted) return;
        setFirstDayStatus(mapBackendStatus(ATTENDANCE_STEPS[0].status));
        setSecondDayStatus(mapBackendStatus(ATTENDANCE_STEPS[1].status));
        setThirdDayStatus(mapBackendStatus(ATTENDANCE_STEPS[2].status));
        setFourthDayStatus(mapBackendStatus(ATTENDANCE_STEPS[3].status));
        setFifthDayStatus(mapBackendStatus(ATTENDANCE_STEPS[4].status));
        setSixthDayStatus(mapBackendStatus(ATTENDANCE_STEPS[5].status));
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchStatus();
    return () => {
      mounted = false;
    };
  }, []);

  const isDone = firstDayStatus === 'done';
  const isCurrent = firstDayStatus === 'current';
  const showFirstStamp = isDone || isCurrent;

  const isSecondDone = secondDayStatus === 'done';
  const isSecondCurrent = secondDayStatus === 'current';
  const showSecondStamp = isSecondDone || isSecondCurrent;

  const isThirdDone = thirdDayStatus === 'done';
  const isThirdCurrent = thirdDayStatus === 'current';
  const showThirdStamp = isThirdDone || isThirdCurrent;

  const isFourthDone = fourthDayStatus === 'done';
  const isFourthCurrent = fourthDayStatus === 'current';
  const showFourthStamp = isFourthDone || isFourthCurrent;

  const isFifthDone = fifthDayStatus === 'done';
  const isFifthCurrent = fifthDayStatus === 'current';
  const showFifthStamp = isFifthDone || isFifthCurrent;

  const isSixthDone = sixthDayStatus === 'done';
  const isSixthCurrent = sixthDayStatus === 'current';
  const showSixthStamp = isSixthDone || isSixthCurrent;

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
          {showFirstStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp"
              width={245}
              height={220}
              className={`${styles.stamp} ${isCurrent ? styles.stampCurrent : ''}`}
              onClick={() => {
                if (isCurrent) setFirstDayStatus('done');
              }}
            />
          )}
          {showSecondStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day2"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay2} ${
                isSecondCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => {
                if (isSecondCurrent) setSecondDayStatus('done');
              }}
            />
          )}
          {showThirdStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day3"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay3} ${
                isThirdCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => {
                if (isThirdCurrent) setThirdDayStatus('done');
              }}
            />
          )}
          {showFourthStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day4"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay4} ${
                isFourthCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => {
                if (isFourthCurrent) setFourthDayStatus('done');
              }}
            />
          )}
          {showFifthStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day5"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay5} ${
                isFifthCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => {
                if (isFifthCurrent) setFifthDayStatus('done');
              }}
            />
          )}
          {showSixthStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp day6"
              width={245}
              height={220}
              className={`${styles.stamp} ${styles.stampDay6} ${
                isSixthCurrent ? styles.stampCurrent : ''
              }`}
              onClick={() => {
                if (isSixthCurrent) setSixthDayStatus('done');
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
