'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './attendance.module.css';
import layoutStyles from '../mypage.module.css';
import {
  getAttendanceStatus,
  stampTodayAttendance,
} from '@/lib/gamification';

export default function AttendancePage() {
  const [firstDayStatus, setFirstDayStatus] = useState(null);
  const [secondDayStatus, setSecondDayStatus] = useState(null);
  const [thirdDayStatus, setThirdDayStatus] = useState(null);
  const [fourthDayStatus, setFourthDayStatus] = useState(null);
  const [fifthDayStatus, setFifthDayStatus] = useState(null);
  const [sixthDayStatus, setSixthDayStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStamping, setIsStamping] = useState(false);

  const mapBackendStatus = (val) => {
    if (val === true || val === 'T') return 'current';
    if (val === false || val === 'F') return 'upcoming';
    if (val === 'done' || val === 'current' || val === 'upcoming') return val;
    return 'upcoming';
  };

  // 출석 현황 다시 불러오는 함수 (GET /api/attendance/status/)
  const fetchStatus = async () => {
    try {
      const data = await getAttendanceStatus();

      setFirstDayStatus(mapBackendStatus(data.firstDayStatus));
      setSecondDayStatus(mapBackendStatus(data.secondDayStatus));
      setThirdDayStatus(mapBackendStatus(data.thirdDayStatus));
      setFourthDayStatus(mapBackendStatus(data.fourthDayStatus));
      setFifthDayStatus(mapBackendStatus(data.fifthDayStatus));
      setSixthDayStatus(mapBackendStatus(data.sixthDayStatus));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // 도장 클릭했을 때: 오늘 도장 찍기 POST → 다시 상태 GET
  const handleStampClick = async () => {
    // 현재 찍을 수 있는 칸이 없으면 막기
    const hasCurrent =
      firstDayStatus === 'current' ||
      secondDayStatus === 'current' ||
      thirdDayStatus === 'current' ||
      fourthDayStatus === 'current' ||
      fifthDayStatus === 'current' ||
      sixthDayStatus === 'current';

    if (!hasCurrent || isStamping) return;

    try {
      setIsStamping(true);
      const res = await stampTodayAttendance();
      // 백엔드에서 400/200 메시지 내려줄 수 있으니까 로그만 찍어둠
      console.log('stampTodayAttendance result:', res);

      // 도장 찍고 나서 다시 출석 현황 불러오기
      await fetchStatus();
    } catch (err) {
      console.error(err);
      // 백엔드에서 내려준 detail이 있으면 띄워주기
      const msg =
        err?.detail ||
        err?.message ||
        '출석 처리 중 오류가 발생했습니다.';
      alert(msg);
    } finally {
      setIsStamping(false);
    }
  };

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
              className={`${styles.stamp} ${
                isCurrent ? styles.stampCurrent : ''
              }`}
              // ✅ 현재 칸일 때만 클릭 가능
              onClick={isCurrent && !isStamping ? handleStampClick : undefined}
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
              onClick={
                isSecondCurrent && !isStamping
                  ? handleStampClick
                  : undefined
              }
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
              onClick={
                isThirdCurrent && !isStamping ? handleStampClick : undefined
              }
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
              onClick={
                isFourthCurrent && !isStamping ? handleStampClick : undefined
              }
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
              onClick={
                isFifthCurrent && !isStamping ? handleStampClick : undefined
              }
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
              onClick={
                isSixthCurrent && !isStamping ? handleStampClick : undefined
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}