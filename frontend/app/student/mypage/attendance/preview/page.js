'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '../attendance.module.css';

const INPUT_OPTIONS = ['T', 'F'];

const mapInputToStatus = (value) => {
  if (value === 'T' || value === true) return 'current';
  if (value === 'F' || value === false) return 'upcoming';
  if (value === 'done') return 'done';
  return 'upcoming';
};

export default function AttendancePreview() {
  const [rawStatus1, setRawStatus1] = useState('T');
  const [rawStatus2, setRawStatus2] = useState('F');
  const [rawStatus3, setRawStatus3] = useState('F');
  const [rawStatus4, setRawStatus4] = useState('F');
  const [rawStatus5, setRawStatus5] = useState('F');
  const [rawStatus6, setRawStatus6] = useState('F');
  const firstDayStatus = mapInputToStatus(rawStatus1);
  const secondDayStatus = mapInputToStatus(rawStatus2);
  const thirdDayStatus = mapInputToStatus(rawStatus3);
  const fourthDayStatus = mapInputToStatus(rawStatus4);
  const fifthDayStatus = mapInputToStatus(rawStatus5);
  const sixthDayStatus = mapInputToStatus(rawStatus6);
  const isDone = firstDayStatus === 'done';
  const isCurrent = firstDayStatus === 'current';
  const showStamp = isDone || isCurrent;
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
    <main className={styles.attendanceMain} style={{ paddingTop: '20px' }}>
      <div className={styles.attendanceFrame}>
        <div className={styles.topRow}>
          <h2 className={styles.pageTitle}>출석 현황 (Preview)</h2>
        </div>
        <div className={styles.headerDivider}></div>

        <div className={styles.previewControls}>
          <label className={styles.previewLabel} htmlFor="first-day-status">
            1일차 입력값 (T/F)
          </label>
          <select
            id="first-day-status"
            className={styles.previewSelect}
            value={rawStatus1}
            onChange={(e) => setRawStatus1(e.target.value)}
          >
            {INPUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="done">done (강제 완료)</option>
          </select>
        </div>

        <div className={styles.previewControls}>
          <label className={styles.previewLabel} htmlFor="second-day-status">
            2일차 입력값 (T/F)
          </label>
          <select
            id="second-day-status"
            className={styles.previewSelect}
            value={rawStatus2}
            onChange={(e) => setRawStatus2(e.target.value)}
          >
            {INPUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="done">done (강제 완료)</option>
          </select>
        </div>

        <div className={styles.previewControls}>
          <label className={styles.previewLabel} htmlFor="third-day-status">
            3일차 입력값 (T/F)
          </label>
          <select
            id="third-day-status"
            className={styles.previewSelect}
            value={rawStatus3}
            onChange={(e) => setRawStatus3(e.target.value)}
          >
            {INPUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="done">done (강제 완료)</option>
          </select>
        </div>

        <div className={styles.previewControls}>
          <label className={styles.previewLabel} htmlFor="fourth-day-status">
            4일차 입력값 (T/F)
          </label>
          <select
            id="fourth-day-status"
            className={styles.previewSelect}
            value={rawStatus4}
            onChange={(e) => setRawStatus4(e.target.value)}
          >
            {INPUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="done">done (강제 완료)</option>
          </select>
        </div>

        <div className={styles.previewControls}>
          <label className={styles.previewLabel} htmlFor="fifth-day-status">
            5일차 입력값 (T/F)
          </label>
          <select
            id="fifth-day-status"
            className={styles.previewSelect}
            value={rawStatus5}
            onChange={(e) => setRawStatus5(e.target.value)}
          >
            {INPUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="done">done (강제 완료)</option>
          </select>
        </div>

        <div className={styles.previewControls}>
          <label className={styles.previewLabel} htmlFor="sixth-day-status">
            6일차 입력값 (T/F)
          </label>
          <select
            id="sixth-day-status"
            className={styles.previewSelect}
            value={rawStatus6}
            onChange={(e) => setRawStatus6(e.target.value)}
          >
            {INPUT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="done">done (강제 완료)</option>
          </select>
        </div>

        <div className={styles.boardWrap}>
          <Image
            src="/attendance-board.svg"
            alt="attendance board"
            width={1044}
            height={701}
            className={styles.boardImage}
            priority
          />
          {showStamp && (
            <Image
              src="/attendance-stamp.svg"
              alt="attendance stamp"
              width={245}
              height={220}
              className={`${styles.stamp} ${isCurrent ? styles.stampCurrent : ''}`}
              onClick={() => {
                if (isCurrent) setRawStatus1('done');
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
                if (isSecondCurrent) setRawStatus2('done');
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
                if (isThirdCurrent) setRawStatus3('done');
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
                if (isFourthCurrent) setRawStatus4('done');
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
                if (isFifthCurrent) setRawStatus5('done');
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
                if (isSixthCurrent) setRawStatus6('done');
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
