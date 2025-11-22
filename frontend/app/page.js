// app/page.js (기존 /login의 내용을 여기에 배치)

'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css'; // 기존 /login 경로의 CSS 사용
import Image from 'next/image';
import Link from 'next/link'; 

export default function LoginPage() {
  const router = useRouter();
  // 루트 경로에서는 role을 받지 않습니다.
  // const searchParams = useSearchParams(); 
  // const role = searchParams.get('role'); 

  // 역할이 정해지지 않은 상태의 임시 로그인 핸들러
  const handleLogin = () => {
    // 실제 로그인 처리 (API 호출 등)
    // 성공 시 역할에 따라 리다이렉션 (이 로직은 추후 수정 필요)
    
    // 현재는 역할 선택 기능이 없으므로 임시로 학생/관리자 로그인 버튼을 만들 필요가 있지만,
    // 디자인 상으로는 하나의 로그인 버튼만 있으므로, 성공 후 학생 페이지로 이동한다고 가정합니다.
    console.log('로그인을 시도합니다.');
    
    // TODO: 실제로는 아이디/비밀번호를 확인하여 role을 얻은 후 리다이렉트해야 합니다.
    const tempUserId = document.getElementById('id').value;
    if (tempUserId === 'admin') {
      router.replace('/admin');
    } else if (tempUserId === 'student') {
      router.replace('/student');
    } else {
      // 로그인 실패 처리 (예시)
      alert('로그인 정보가 올바르지 않습니다.');
    }
  };


  return (
    // 'Desktop - 133' 스타일이 적용될 전체 레이아웃
    <div className={styles.pageLayout}>
      
      {/* 'ChatGPT Image...' (로고) */}
      <header className={styles.header}>
        <Image
          src="/doro-logo.svg" 
          alt="DORO 로고"
          width={509} 
          height={131} 
          priority={true}
        />
      </header>

      {/* 'Line 1' (메인 선) */}
      <div className={styles.mainLine}></div>

      {/* 3. 메인 콘텐츠 영역 (로그인폼 + 공지사항) */}
      <main className={styles.mainContainer}>
        
        {/* 3-1. 왼쪽: 로그인 폼 섹션 */}
        <section className={styles.loginSection}>
          
          {/* 'Start Your Learning...' (로그인 화면은 제목 고정) */}
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
          
          {/* '회원가입' (역할 선택 페이지로 이동) */}
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