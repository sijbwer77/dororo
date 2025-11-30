// components/SideBarFooter.js

'use client';

import styles from './SideBarFooter.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SideBarFooter() {
  const router = useRouter();

  const handleBack = () => {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      const ref = document.referrer || '';

      // 바로 전 페이지가 student 영역이면 진짜 "뒤로가기"
      if (ref.includes('/student')) {
        router.back();
        return;
      }
    }
    // 그 외(로그인 등)에서는 학생 홈으로 보내기
    router.push('/student');
  };

  const handleHome = () => {
    router.push('/student'); // '나의 강의실'
  };

  return (
    <div className={styles.sidebarFooter}>
      <div className={styles.footerIcon} onClick={handleBack}>
        <Image
          src="/back.svg"
          alt="뒤로가기"
          width={22}
          height={21}
        />
      </div>

      <div className={styles.footerIcon} onClick={handleHome}>
        <Image
          src="/home-icon.svg"
          alt="홈"
          width={34}
          height={33}
        />
      </div>
    </div>
  );
}
