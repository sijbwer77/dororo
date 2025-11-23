// app/signup/page.js (기존 루트(/)의 역할을 수행하며, /signup으로 이동함)

'use client';
import Link from 'next/link';
import styles from '../SelectRole.module.css'; // SelectRole.module.css 사용
import Image from 'next/image';

export default function SelectRolePage() {
  return (
    // 'Desktop - 126' (전체 페이지 레이아웃)
    <div className={styles.pageLayout}> 
      
      {/* 'ChatGPT Image...' (로고) */}
      <header className={styles.header}>
        <Image
          src="/doro-logo.svg" 
          alt="DORO 로고"
          width={222} 
          height={53} 
          priority={true}
        />
      </header>

      {/* 'Line 1' (파란색 선) */}
      <div className={styles.headerLine}></div>

      {/* 타이틀 추가: "회원가입을 위한 역할을 선택해주세요" */}
      <h2 className={styles.roleSelectionTitle}>역할을 선택해주세요</h2>

      {/* 두 박스를 감싸는 컨테이너 */}
      <main className={styles.boxContainer}>
        
        {/* (1) 학생/학부모 박스 ('Rectangle 161') - 클릭 시 폼 페이지로 이동 */}
        <Link href="/signup/form?role=student" className={styles.roleBoxStudent}>
          
          {/* 학생 아이콘 ('Icon') */}
          <div className={styles.iconWrapperStudent}>
            <Image
              src="/student-icon.svg" 
              alt="학생 아이콘"
              width={122} 
              height={122}
            />
          </div>
          
          {/* 학생 버튼 ('Rectangle 174') */}
          <div className={styles.roleButtonStudent}>
            {/* '학생/학부모' 텍스트 */}
            <span className={styles.roleTextStudent}>학생/학부모</span>
          </div>
        </Link>

        {/* (2) 매니저 박스 ('Rectangle 162') - 클릭 시 폼 페이지로 이동 */}
        <Link href="/signup/form?role=admin" className={styles.roleBoxManager}>
          
          {/* 매니저 아이콘 ('Icon') */}
          <div className={styles.iconWrapperManager}>
            <Image
              src="/manager-icon.svg" 
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

      {/* (삭제됨) 회원가입 링크 영역은 더 이상 필요 없음 */}

    </div>
  );
}