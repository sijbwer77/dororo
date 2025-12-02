// frontend/app/signup/form/page.js
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../signup.module.css';
import { signupSP, signupMG } from '@/lib/gamification';

export default function SignupFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role'); // 'student' 또는 'admin'
  const roleName = role === 'student' ? '학생/학부모' : '매니저';

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!role) {
      alert('역할 정보가 없습니다. 처음 화면에서 다시 선택해주세요.');
      return;
    }

    const full_name = document.getElementById('name')?.value.trim() || '';
    const username = document.getElementById('id')?.value.trim() || '';
    const password1 = document.getElementById('password')?.value || '';
    const password2 = document.getElementById('passwordConfirm')?.value || '';
    const email1 = document.getElementById('emailPart1')?.value.trim() || '';
    const email2 = document.getElementById('emailPart2')?.value.trim() || '';
    const phone2 = document.getElementById('phonePart2')?.value.trim() || '';
    const phone3 = document.getElementById('phonePart3')?.value.trim() || '';

    if (!full_name || !username || !password1 || !password2 || !phone2 || !phone3) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const payload = {
      username,
      password1,
      password2,
      full_name,
      nickname: '',
      email: email1 && email2 ? `${email1}@${email2}` : '',
      phone1: '010',
      phone2,
      phone3,
    };

    try {
      const signup = role === 'student' ? signupSP : signupMG;
      await signup(payload);
      alert('회원가입이 완료되었습니다.');
      router.push('/');
    } catch (err) {
      console.error('회원가입 실패:', err);
      let msg = '회원가입에 실패했습니다.';
      if (typeof err === 'string') msg = err;
      else if (err.username) msg = Array.isArray(err.username) ? err.username[0] : err.username;
      else if (err.non_field_errors)
        msg = Array.isArray(err.non_field_errors)
          ? err.non_field_errors[0]
          : err.non_field_errors;
      else if (err.error) msg = err.error;
      alert(msg);
    }
  };

  return (
    <div className={styles.pageLayout}>
      <div className={styles.logo}>
        <Image src="/doro-logo.svg" alt="DORO 로고" width={148} height={35} priority />
      </div>

      <h1 className={styles.title}>{roleName} - 회원정보입력</h1>

      <div className={styles.labelBackground}></div>

      <div className={`${styles.horizontalLine} ${styles.line1}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line2}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line3}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line4}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line5}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line6}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line7}`}></div>

      <label className={`${styles.label} ${styles.labelName}`} htmlFor="name">
        이름
      </label>
      <input type="text" id="name" className={`${styles.inputField} ${styles.inputName}`} required />

      <label className={`${styles.label} ${styles.labelId}`} htmlFor="id">
        아이디
      </label>
      <input type="text" id="id" className={`${styles.inputField} ${styles.inputId}`} required />

      <label className={`${styles.label} ${styles.labelPw}`} htmlFor="password">
        비밀번호
      </label>
      <input
        type="password"
        id="password"
        className={`${styles.inputField} ${styles.inputPw}`}
        required
      />

      <label className={`${styles.label} ${styles.labelPwConfirm}`} htmlFor="passwordConfirm">
        비밀번호 확인
      </label>
      <input
        type="password"
        id="passwordConfirm"
        className={`${styles.inputField} ${styles.inputPwConfirm}`}
        required
      />

      <label className={`${styles.label} ${styles.labelEmail}`} htmlFor="emailPart1">
        이메일
      </label>
      <div className={styles.emailGroup}>
        <input type="text" id="emailPart1" className={styles.inputEmailPart1} placeholder="아이디" />
        <span className={styles.atSymbol}>@</span>
        <input
          type="text"
          id="emailPart2"
          className={styles.inputEmailPart2}
          placeholder="도메인"
        />
      </div>

      <label className={`${styles.label} ${styles.labelPhone}`} htmlFor="phonePart2">
        휴대폰 번호
      </label>
      <div className={styles.phoneGroup}>
        <span className={styles.phonePrefix}>010</span>
        <span className={styles.phoneDash}>-</span>
        <input
          type="text"
          id="phonePart2"
          className={styles.inputPhonePart}
          maxLength="4"
          required
        />
        <span className={styles.phoneDash}>-</span>
        <input
          type="text"
          id="phonePart3"
          className={styles.inputPhonePart}
          maxLength="4"
          required
        />
      </div>

      <button type="button" onClick={handleSubmit} className={styles.submitButton}>
        회원 가입
      </button>
    </div>
  );
}
