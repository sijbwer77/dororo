// frontend/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './login.module.css';
import { login } from '@/lib/users';
import { ensureCsrfCookie } from '@/lib/api';
import { fetchNotices } from '@/lib/notice';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // 🔔 로그인 화면에 보여줄 공지 리스트
  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(true);

  // 제목 너무 길면 ... 처리
  const truncateTitle = (title, maxLength = 22) => {
    if (!title) return '';
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  // 처음 렌더링 시 공지 가져오기
  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = await fetchNotices();
        // 최신 5개만 사용 (원하면 숫자 바꿔도 됨)
        setNotices(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error('공지 불러오기 실패:', err);
        setNotices([]);
      } finally {
        setNoticeLoading(false);
      }
    };

    loadNotices();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // 백엔드 로그인 요청
      const data = await login(username, password);

      // CSRF 쿠키 확보 (필요한 경우)
      await ensureCsrfCookie();

      // 백엔드에서 ok=false로 내려온 경우 방어
      if (!data?.ok) {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
      }

      // role에 따라 페이지 분기
      if (data.role === 'SP') {
        router.replace('/student');
      } else if (data.role === 'MG') {
        router.replace('/manage');
      } else {
        router.replace('/');
      }
    } catch (err) {
      console.error('로그인 실패:', err);

      const errors = err.errors || err;
      let msg = null;

      if (Array.isArray(errors?.non_field_errors)) {
        msg = errors.non_field_errors[0];
      } else if (typeof errors?.non_field_errors === 'string') {
        msg = errors.non_field_errors;
      }

      if (!msg && errors?.username) {
        msg = Array.isArray(errors.username)
          ? errors.username[0]
          : errors.username;
      }
      if (!msg && errors?.password) {
        msg = Array.isArray(errors.password)
          ? errors.password[0]
          : errors.password;
      }

      if (!msg) {
        msg = '아이디 또는 비밀번호가 일치하지 않습니다.';
      }

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
        {/* 로그인 박스 */}
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

        {/* 오른쪽 INFO 영역 */}
        <section className={styles.infoSection}>
          {/* NOTICE 영역 */}
          <div className={styles.infoBox}>
            <h3 className={styles.infoTitle}>NOTICE</h3>
            <span className={styles.plusIcon}>+</span>
          </div>
          <div className={styles.infoLine}></div>

          {/* 🔔 공지 리스트 표시 */}
          <div className={styles.noticeListWrapper}>
            {noticeLoading ? (
              <p className={styles.noticeEmpty}>공지를 불러오는 중입니다...</p>
            ) : notices.length === 0 ? (
              <p className={styles.noticeEmpty}>등록된 공지가 없습니다.</p>
            ) : (
              <ul className={styles.noticeList}>
                {notices.map((notice) => (
                  <li key={notice.id} className={styles.noticeItem}>
                    {truncateTitle(notice.title)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.infoLine}></div>

          {/* CAMP 영역 (나중에 따로 붙이면 됨) */}
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
