// components/SidebarFooter.js

'use client'; // (중요!) useRouter, onClick을 쓰려면 필요합니다.

import styles from './SideBarFooter.module.css'; // (2단계에서 만들 CSS)
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SideBarFooter() {
  const router = useRouter(); 

  const handleBack = () => {
    router.back(); // '이전' 페이지
  };

  const handleHome = () => {
    router.push('/student'); // '나의 강의실'
  };

  return (
    // 'sidebarFooter' 영역
    <div className={styles.sidebarFooter}>
      {/* 'Group 53' (뒤로가기 아이콘) */}
      <div className={styles.footerIcon} onClick={handleBack}>
        <Image
          src="/back.svg" // (필수!) public에 파일이 있어야 함
          alt="뒤로가기"
          width={22}
          height={21}
        />
      </div>
      
      {/* 'codicon:home' (집 아이콘) */}
      <div className={styles.footerIcon} onClick={handleHome}>
        <Image
          src="/home-icon.svg" // (필수!) public에 파일이 있어야 함
          alt="홈"
          width={34}
          height={33}
        />
      </div>
    </div>
  );
}