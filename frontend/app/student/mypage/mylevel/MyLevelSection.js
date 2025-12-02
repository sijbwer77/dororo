'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './mylevel.module.css';
import { getStageInfo } from '../stageConfig';
import { getMyLevel } from '@/lib/gamification';

export default function MyLevelSection() {
  const [expData, setExpData] = useState(null);
  const [trait, setTrait] = useState('D');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyLevel();

        // 백엔드 구조: { exp: {...}, trait: null, badges: [], ... }
        const exp = data.exp ?? {};

        setExpData({
          current: exp.stepExpCurrent ?? 0,
          target: exp.stepExpMax ?? 1,
          stage: exp.stage ?? 1,
          step: exp.step ?? 1,
          total: exp.total ?? 0,
          max: exp.max ?? 4200,
        });

        setTrait(data.trait ?? 'D');
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  if (isLoading || !expData) {
    return (
      <section className={styles.myLevelLayout}>
        <div className={styles.loadingText}>레벨 정보를 불러오는 중...</div>
      </section>
    );
  }

  // 기존 stageConfig 로직을 그대로 사용
  const stage = getStageInfo(expData.total, trait);
  const showSubmarine = Boolean(stage.submarine?.src);
  const submarineClass =
    stage.submarine?.variant === 'red'
      ? styles.redSubmarine
      : stage.submarine?.variant === 'blue'
      ? styles.blueSubmarine
      : stage.submarine?.variant === 'full'
      ? styles.fullSubmarine
      : '';

  if (stage.type === 'stage2') {
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
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center top',
                }
              : undefined
          }
        >
          <div className={styles.stageTwoBackdrop}></div>
          {stage.badges?.map((badge) => (
            <div
              key={badge.src}
              className={`${styles.stageTwoBadge} ${styles[badge.className] || ''}`}
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
              src={stage.submarine?.src ?? ''}
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
        <span className={styles.expValue}>
          {stage.displayCurrent} / {stage.displayTarget}
        </span>
      </div>
    </section>
  );
}
