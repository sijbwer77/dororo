// app/signup/form/page.js

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import styles from '../signup.module.css';

// .env.local 에 NEXT_PUBLIC_API_BASE_URL 없으면 기본으로 127.0.0.1 사용
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

export default function SignupFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // /signup/form?role=student or /signup/form?role=admin
  const roleParam = searchParams.get('role'); // 'student' | 'admin'

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ----------------- 회원가입 요청 -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1) 프론트 role → 백엔드 url용 role(sp / mg)으로 변환
    let backendRole = null;
    if (roleParam === 'student') backendRole = 'sp';
    else if (roleParam === 'admin') backendRole = 'mg';
    else {
      setError('역할 정보가 없습니다. 처음 화면에서 다시 들어와 주세요.');
      setLoading(false);
      return;
    }

    // 2) form 데이터 한 번에 읽기
    const formData = new FormData(e.currentTarget);

    const full_name = formData.get('full_name')?.toString().trim() || '';
    const username = formData.get('username')?.toString().trim() || '';
    const password1 = formData.get('password1')?.toString() || '';
    const password2 = formData.get('password2')?.toString() || '';
    const email1 = formData.get('email1')?.toString().trim() || '';
    const email2 = formData.get('email2')?.toString().trim() || '';
    const phone1 = formData.get('phone1')?.toString().trim() || '010';
    const phone2 = formData.get('phone2')?.toString().trim() || '';
    const phone3 = formData.get('phone3')?.toString().trim() || '';
    const nickname = formData.get('nickname')?.toString().trim() || '';

    // 백엔드가 기대하는 필드 이름에 맞춰 payload 구성
    const payload = {
      full_name,
      username,
      password1,
      password2,
      nickname,
      email: email1 && email2 ? `${email1}@${email2}` : '', // 둘 다 비었으면 빈 문자열
      phone1,
      phone2,
      phone3,
    };

    try {
      const res = await fetch(`${API_BASE}/api/users/signup/${backendRole}/`, {
        // 만약 urls.py에서 prefix가 /api/users/가 아니면 위 주소 수정하면 됨
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 세션 로그인 유지
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('signup error', data);

        // 백엔드에서 오는 에러 형식(SignupSerializer & DRF 기본)에 맞춰 메시지 뽑기
        if (data.username && data.username[0]) {
          setError(data.username[0]); // 아이디 중복 등
        } else if (data.non_field_errors && data.non_field_errors[0]) {
          setError(data.non_field_errors[0]); // 비번 불일치 등
        } else if (typeof data === 'string') {
          setError(data);
        } else {
          setError('회원가입에 실패했습니다.');
        }
        return;
      }

      // 성공: 백엔드에서 이미 login(request, user) 호출함
      console.log('signup success', data);
      // 원하는 페이지로 이동 (홈/로그인 등)
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------- 화면 -----------------
  return (
    <div className={styles.pageLayout}>
      {/* 로고 */}
      <div className={styles.logo}>
        <Image
          src="/doro-logo.svg"
          alt="DORO 로고"
          width={148}
          height={35}
          priority
        />
      </div>

      {/* 상단 파란 라인 */}
      <div className={styles.line1}></div>

      {/* 제목 */}
      <h2 className={styles.title}>회원정보입력</h2>

      {/* 레이블 배경 박스 */}
      <div className={styles.labelBackground}></div>

      <form onSubmit={handleSubmit}>
        {/* 이름 */}
        <label
          htmlFor="full_name"
          className={`${styles.label} ${styles.labelName}`}
        >
          이름
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          className={`${styles.inputField} ${styles.inputName}`}
          required
        />

        {/* 아이디 */}
        <label
          htmlFor="username"
          className={`${styles.label} ${styles.labelId}`}
        >
          아이디
        </label>
        <input
          id="username"
          name="username"
          type="text"
          className={`${styles.inputField} ${styles.inputId}`}
          required
        />

        {/* 비밀번호 */}
        <label
          htmlFor="password1"
          className={`${styles.label} ${styles.labelPw}`}
        >
          비밀번호
        </label>
        <input
          id="password1"
          name="password1"
          type="password"
          className={`${styles.inputField} ${styles.inputPw}`}
          required
        />

        {/* 비밀번호 확인 */}
        <label
          htmlFor="password2"
          className={`${styles.label} ${styles.labelPwConfirm}`}
        >
          비밀번호 확인
        </label>
        <input
          id="password2"
          name="password2"
          type="password"
          className={`${styles.inputField} ${styles.inputPwConfirm}`}
          required
        />

        {/* 이메일 */}
        <label
          htmlFor="email1"
          className={`${styles.label} ${styles.labelEmail}`}
        >
          이메일
        </label>
        <div className={styles.emailGroup}>
          <input
            id="email1"
            name="email1"
            type="text"
            className={`${styles.inputField} ${styles.inputEmailPart1}`}
            placeholder="example"
          />
          <span className={styles.atSymbol}>@</span>
          <input
            id="email2"
            name="email2"
            type="text"
            className={`${styles.inputField} ${styles.inputEmailPart2}`}
            placeholder="domain.com"
          />
        </div>

        {/* 휴대폰 번호 */}
        <label
          htmlFor="phone2"
          className={`${styles.label} ${styles.labelPhone}`}
        >
          휴대폰 번호
        </label>
        <div className={styles.phoneGroup}>
          <span className={styles.phonePrefix}>010</span>
          <span className={styles.phoneDash}>-</span>
          <input
            id="phone2"
            name="phone2"
            type="text"
            className={`${styles.inputField} ${styles.inputPhonePart}`}
            required
          />
          <span className={styles.phoneDash}>-</span>
          <input
            id="phone3"
            name="phone3"
            type="text"
            className={`${styles.inputField} ${styles.inputPhonePart}`}
            required
          />
          {/* phone1은 010 고정값으로 hidden 전송 */}
          <input type="hidden" name="phone1" value="010" />
        </div>

        {/* 닉네임 (디자인에 없으면 안 써도 되지만, 백엔드에 맞춰 옵션으로 넣어둠) */}
        {/* 필요 없으면 이 블록은 지워도 됨 */}
        {/* 
        <label
          htmlFor="nickname"
          className={`${styles.label} ${styles.labelNickname}`}
        >
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          className={`${styles.inputField} ${styles.inputNickname}`}
        />
        */}

        {/* 에러 메시지 */}
        {error && (
          <p
            style={{
              position: 'absolute',
              top: 620,
              left: 370,
              color: 'red',
              fontSize: '14px',
            }}
          >
            {error}
          </p>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? '처리 중...' : '회원가입 완료'}
        </button>
      </form>
    </div>
  );
}
