// app/page.js

'use client';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Image from 'next/image';
import Link from 'next/link'; 

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    console.log('로그인을 시도합니다.');

    const tempUserId = document.getElementById('id').value;

    // 아이디가 admin이면 관리자 페이지로,
    // 그 외에는 전부 학생 페이지로 보냄
    if (tempUserId === 'admin') {
      router.replace('/manage');
    } else {
      router.replace('/student');
    }
  };

  return (
    <div className={styles.pageLayout}>
      <header className={styles.header}>
        <Image
          src="/doro-logo.svg" 
          alt="DORO 로고"
          width={509} 
          height={131} 
          priority={true}
        />
      </header>

      <div className={styles.mainLine}></div>

      <main className={styles.mainContainer}>
        <section className={styles.loginSection}>
          <h2 className={styles.title}>Start Your Learning with DORO</h2>
          <div className={styles.sectionLine}></div>

          <div className={styles.inputGroup}>
            <label htmlFor="id" className={styles.label}>ID</label>
            <input type="text" id="id" className={styles.inputField} />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="pw" className={styles.label}>PW</label>
            <input type="password" id="pw" className={styles.inputField} />
          </div>

          <button onClick={handleLogin} className={styles.loginButton}>
            Log in
          </button>

          <div className={styles.bottomLine}></div>
          
          <Link href="/signup" className={styles.signupLink}>
            회원가입
          </Link>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>NOTICE</h3>
            <span className={styles.plusIcon}>+</span>
          </div>
          <div className={styles.infoLine}></div>

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
