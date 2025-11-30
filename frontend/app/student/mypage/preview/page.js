'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../mypage.module.css';
import { getStageInfo } from '../stageConfig.js';

const INPUT_MAX = 6000;

export default function MyLevelPreviewPage() {
  const [exp, setExp] = useState(50);
  const [trait, setTrait] = useState("D");

  const clampExp = (value) => {
    if (Number.isNaN(value)) return 0;
    return Math.min(INPUT_MAX, Math.max(0, value));
  };

  const handleExpChange = (value) => {
    setExp(clampExp(value));
  };

  const stage = getStageInfo(exp, trait);
  const showSubmarine = Boolean(stage.submarine?.src);
  const submarineClass =
    stage.submarine?.variant === "red"
      ? styles.redSubmarine
      : stage.submarine?.variant === "blue"
      ? styles.blueSubmarine
      : stage.submarine?.variant === "full"
      ? styles.fullSubmarine
      : "";

  const stageLayoutClass =
    stage.type === "stage2"
      ? `${styles.myLevelLayout} ${styles.stageTwoLayout}`
      : styles.myLevelLayout;

  return (
    <div className={styles.pageLayout}>
      <main className={styles.mainContent} style={{ width: '100%' }}>
        <section className={stageLayoutClass}>
          <header className={styles.myLevelHeader}>
            <h2 className={styles.stageLabel}>{stage.label} (Preview)</h2>
            <Link href="/student/mypage/attendance/preview" className={styles.attendanceBtn}>
              <Image src="/calendar-star.svg" alt="calendar" width={24} height={24} />
              <span>출결 현황 체크</span>
            </Link>
          </header>
          <div className={styles.stageDivider}></div>

          <div
            style={{
              display: 'flex',
              gap: '18px',
              alignItems: 'center',
              marginTop: '16px',
              marginBottom: '8px',
              flexWrap: 'wrap',
            }}
          >
            <label style={{ fontFamily: 'KoPubWorldDotum', fontSize: '18px', color: '#0A5FAE' }}>
              EXP 값
              <input
                type="number"
                min={0}
                max={INPUT_MAX}
                value={exp}
                onChange={(e) => handleExpChange(Number(e.target.value))}
                style={{
                  marginLeft: '8px',
                  width: '80px',
                  padding: '4px 6px',
                  border: '1px solid #0A5FAE',
                  borderRadius: '6px',
                }}
              />
            </label>
            <label style={{ fontFamily: 'KoPubWorldDotum', fontSize: '18px', color: '#0A5FAE' }}>
              DIMC
              <select
                value={trait}
                onChange={(e) => setTrait(e.target.value)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 6px',
                  border: '1px solid #0A5FAE',
                  borderRadius: '6px',
                }}
              >
                {['D', 'I', 'M', 'C'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <input
              type="range"
              min={0}
              max={INPUT_MAX}
              value={exp}
              onChange={(e) => handleExpChange(Number(e.target.value))}
              style={{ flex: '1 1 280px' }}
            />
            <span style={{ fontFamily: 'KoPubWorldDotum', fontSize: '18px', color: '#0A5FAE', whiteSpace: 'nowrap' }}>
              {stage.displayCurrent} / {stage.displayTarget}
            </span>
          </div>

          {stage.type === "stage2" ? (
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
          ) : (
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
          )}

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
      </main>
    </div>
  );
}
