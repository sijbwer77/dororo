// frontend/app/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';
import { login } from '@/lib/users';
import { ensureCsrfCookie } from '@/lib/api';

async function handleLogin() {
  await login(id, pw);           // 세션 로그인
  await ensureCsrfCookie();      // csrftoken 쿠키 받기
  // -> 마이페이지로 이동
}


export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const data = await login(username, password);
      if (!data?.ok) {
        alert('로그인에 실패했습니다.');
        return;
      }

      if (data.role === 'SP') {
        router.replace('/student');
      } else if (data.role === 'MG') {
        router.replace('/manage');
      } else {
        router.replace('/');
      }
    } catch (err) {
      console.error('로그인 실패:', err);
      const msg =
        err.errors?.non_field_errors?.[0] ||
        '아이디 또는 비밀번호가 일치하지 않습니다.';
      alert(msg);
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
          priority
        />
      </header>

      <div className={styles.mainLine}></div>

      <main className={styles.mainContainer}>
        <section className={styles.loginSection}>
          <h2 className={styles.title}>Start Your Learning with DORO</h2>
          <div className={styles.sectionLine}></div>

          <div className={styles.inputGroup}>
            <label htmlFor="id" className={styles.label}>
              ID
            </label>
            <input
              type="text"
              id="id"
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="pw" className={styles.label}>
              PW
            </label>
            <input
              type="password"
              id="pw"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
