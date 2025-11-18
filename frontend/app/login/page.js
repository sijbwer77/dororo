// app/login/page.js

'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css'; // 로그인 페이지 전용 CSS
import Image from 'next/image';
import Link from 'next/link'; // '회원가입' 링크용

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const role = searchParams.get('role'); 

const handleLogin = () => {
    if (role === 'student') {
      console.log('학생으로 로그인합니다.');
      router.replace('/student'); // ⬅️ 'replace'로 수정
    } else if (role === 'admin') {
      console.log('관리자로 로그인합니다.');
      router.replace('/admin'); // ⬅️ 'replace'로 수정
    } else {
      alert('역할을 먼저 선택해주세요!');
      router.push('/'); // (여기는 push가 맞습니다)
    }
  };

  const title = role === 'student' ? 
    "Start Your Learning with DORO" : 
    "Admin Page";

  return (
    // 'Desktop - 133' 스타일이 적용될 전체 레이아웃
    <div className={styles.pageLayout}>
      
      {/* 'ChatGPT Image...' (로고) */}
      <header className={styles.header}>
        <Image
          src="/doro-logo.svg" // (필수!) public 폴더에 로고 파일이 있어야 합니다.
          alt="DORO 로고"
          width={509} // (필수!) 님이 주신 CSS의 너비
          height={131} // (필수!) 님이 주신 CSS의 높이
          priority={true}
        />
      </header>

      {/* 'Line 1' (메인 선) */}
      <div className={styles.mainLine}></div>

      {/* 3. 메인 콘텐츠 영역 (로그인폼 + 공지사항) */}
      <main className={styles.mainContainer}>
        
        {/* 3-1. 왼쪽: 로그인 폼 섹션 */}
        <section className={styles.loginSection}>
          
          {/* 'Start Your Learning...' */}
          <h2 className={styles.title}>Start Your Learning with DORO</h2>
          {/* 'Line 66' */}
          <div className={styles.sectionLine}></div>

          {/* 'ID' + 'Rectangle 8' */}
          <div className={styles.inputGroup}>
            <label htmlFor="id" className={styles.label}>ID</label>
            <input type="text" id="id" className={styles.inputField} />
          </div>
          
          {/* 'PW' + 'Rectangle 9' */}
          <div className={styles.inputGroup}>
            <label htmlFor="pw" className={styles.label}>PW</label>
            <input type="password" id="pw" className={styles.inputField} />
          </div>

          {/* 'Rectangle 10' + 'Log in' */}
          <button onClick={handleLogin} className={styles.loginButton}>
            Log in
          </button>

          {/* 'Line 68' */}
          <div className={styles.bottomLine}></div>
          
          {/* '회원가입' */}
          <Link href="/signup" className={styles.signupLink}>
            회원가입
          </Link>
        </section>

        {/* 3-2. 오른쪽: 공지사항 섹션 */}
        <section className={styles.infoSection}>
          {/* 'NOTICE' + 'Line 3' + '+' */}
          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>NOTICE</h3>
            <span className={styles.plusIcon}>+</span>
          </div>
          <div className={styles.infoLine}></div>

          {/* 'CAMP' + 'Line 67' + '+' */}
          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>CAMP</h3>
            <span className={styles.plusIcon}>+</span>
          </div>
          <div className={styles.infoLine}></div>
        </section>

      </main>
    </div>
  );
}