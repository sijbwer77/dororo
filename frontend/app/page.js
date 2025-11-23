'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import Image from 'next/image';
import Link from 'next/link';
// 👇 API 함수 가져오기 (경로 @/lib/api 로 수정됨)
import { login } from '@/lib/api'; 

export default function LoginPage() {
  const router = useRouter();

  // 입력값 상태 관리 (React 방식)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // 1. 유효성 검사
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 2. 진짜 백엔드랑 통신!
      console.log('로그인 시도 중:', username); 
      const data = await login(username, password);

      // 3. 성공 시 처리
      if (data.ok) {
        console.log('로그인 성공!', data);

        // 역할(Role)에 따라 페이지 이동
        if (data.role === 'SP') {
          router.replace('/student'); 
        } else if (data.role === 'MG') {
          router.replace('/admin');
        } else {
          alert(`관리자(Superuser) 로그인 성공!\n역할: ${data.role || '없음'}`);
        }
      }
    } catch (err) {
      // 4. 실패 시 처리
      console.error('로그인 실패:', err);
      const msg = err.errors?.non_field_errors?.[0] || '아이디 또는 비밀번호가 일치하지 않습니다.';
      alert(msg);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <header className={styles.header}>
        <Image src="/doro-logo.svg" alt="DORO 로고" width={509} height={131} priority={true} />
      </header>

      <div className={styles.mainLine}></div>

      <main className={styles.mainContainer}>
        <section className={styles.loginSection}>
          <h2 className={styles.title}>Start Your Learning with DORO</h2>
          <div className={styles.sectionLine}></div>

          {/* ID 입력창 (수정됨) */}
          <div className={styles.inputGroup}>
            <label htmlFor="id" className={styles.label}>ID</label>
            <input 
              type="text" 
              id="id" 
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 👈 입력 연결
            />
          </div>
          
          {/* PW 입력창 (수정됨) */}
          <div className={styles.inputGroup}>
            <label htmlFor="pw" className={styles.label}>PW</label>
            <input 
              type="password" 
              id="pw" 
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)} // 👈 입력 연결
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
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
          {/* 공지사항 (기존 유지) */}
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