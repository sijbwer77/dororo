// app/page.js

'use client';
import Link from 'next/link';
import styles from './SelectRole.module.css'; // 새 CSS 파일
import Image from 'next/image';

export default function SelectRolePage() {
  return (
    // 'Desktop - 126' (전체 페이지 레이아웃)
    <div className={styles.pageLayout}> 
      
      {/* 'ChatGPT Image...' (로고) */}
      <header className={styles.header}>
        <Image
          src="/doro-logo.svg" // (필수!) public 폴더에 로고가 있어야 함
          alt="DORO 로고"
          width={222} // 님이 주신 CSS 너비
          height={53} // 님이 주신 CSS 높이
          priority={true}
        />
      </header>

      {/* 'Line 1' (파란색 선) */}
      <div className={styles.headerLine}></div>

      {/* 두 박스를 감싸는 컨테이너 */}
      <main className={styles.boxContainer}>
        
        {/* (1) 학생/학부모 박스 ('Rectangle 161') */}
        <Link href="/login?role=student" className={styles.roleBoxStudent} replace>
          
          {/* 학생 아이콘 ('Icon') */}
          <div className={styles.iconWrapperStudent}>
            <Image
              src="/student-icon.svg" // (필수!) public 폴더에 아이콘이 있어야 함
              alt="학생 아이콘"
              width={122} // 님이 주신 CSS 높이값 기준
              height={122}
            />
          </div>
          
          {/* 학생 버튼 ('Rectangle 174') */}
          <div className={styles.roleButtonStudent}>
            {/* '학생/학부모' 텍스트 */}
            <span className={styles.roleTextStudent}>학생/학부모</span>
          </div>
        </Link>

        {/* (2) 매니저 박스 ('Rectangle 162') */}
        <Link href="/login?role=admin" className={styles.roleBoxManager} replace>
          
          {/* 매니저 아이콘 ('Icon') */}
          <div className={styles.iconWrapperManager}>
            <Image
              src="/manager-icon.svg" // (필수!) public 폴더에 아이콘이 있어야 함
              alt="매니저 아이콘"
              width={122}
              height={122}
            />
          </div>
          
          {/* 매니저 버튼 ('Rectangle 175') */}
          <div className={styles.roleButtonManager}>
            {/* '매니저' 텍스트 */}
            <span className={styles.roleTextManager}>매니저</span>
          </div>
        </Link>

      </main>
    </div>
  );
}