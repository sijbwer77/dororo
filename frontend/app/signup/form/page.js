// app/signup/form/page.js

'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from '../signup.module.css';
import Image from 'next/image';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

export default function SignupFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role'); // 'student' 또는 'admin'

  const roleName = role === 'student' ? '학생/학부모' : '매니저';

  // 🔥 여기만 바뀐 핵심 로직
  const handleSubmit = async (e) => {
    // 버튼 type="button" 이라서 기본 동작은 없지만, 혹시 몰라서 한 번 막아둠
    e?.preventDefault?.();

    // 1) role → 백엔드용 코드(sp/mg)
    let backendRole = null;
    if (role === 'student') backendRole = 'sp';
    else if (role === 'admin') backendRole = 'mg';
    else {
      alert('역할 정보가 없습니다. 처음 화면에서 다시 들어와 주세요.');
      return;
    }

    // 2) DOM에서 값 읽기 (UI 안 건드리고 값만 가져옴)
    const full_name = document.getElementById('name')?.value.trim() || '';
    const username = document.getElementById('id')?.value.trim() || '';
    const password1 = document.getElementById('password')?.value || '';
    const password2 = document.getElementById('passwordConfirm')?.value || '';
    const email1 = document.getElementById('emailPart1')?.value.trim() || '';
    const email2 = document.getElementById('emailPart2')?.value.trim() || '';
    const phone2 = document.getElementById('phonePart2')?.value.trim() || '';
    const phone3 = document.getElementById('phonePart3')?.value.trim() || '';

    // 간단한 프론트 유효성 (필요 없으면 지워도 됨)
    if (!full_name || !username || !password1 || !password2 || !phone2 || !phone3) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const payload = {
      username,
      password1,
      password2,
      full_name,
      nickname: '', // 닉네임 입력칸이 없으니 빈 값 보냄 (Serializer에서 optional)
      email: email1 && email2 ? `${email1}@${email2}` : '',
      phone1: '010',
      phone2,
      phone3,
    };

    try {
      const res = await fetch(`${API_BASE}/api/signup/${backendRole}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('signup error', data);
        let msg = '회원가입에 실패했습니다.';

        if (typeof data === 'string') {
          msg = data;
        } else if (data.username) {
          msg = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.non_field_errors) {
          msg = Array.isArray(data.non_field_errors)
            ? data.non_field_errors[0]
            : data.non_field_errors;
        } else if (data.error) {
          msg = data.error;
        }

        alert(msg);
        return;
      }

      // 성공
      alert('회원가입이 완료되었습니다.');
      router.push('/'); // 회원가입 후 이동할 페이지
    } catch (err) {
      console.error(err);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.pageLayout}>
      {/* 2. 로고 */}
      <div className={styles.logo}>
        <Image
          src="/doro-logo.svg"
          alt="DORO 로고"
          width={148}
          height={35}
          priority={true}
        />
      </div>

      {/* 3. 제목 */}
      <h1 className={styles.title}>{roleName} - 회원정보입력</h1>

      {/* 4. 배경 및 구분선 */}
      <div className={styles.labelBackground}></div>

      <div className={`${styles.horizontalLine} ${styles.line1}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line2}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line3}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line4}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line5}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line6}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line7}`}></div>

      {/* 5. 폼 요소들 - 위치/클래스 전혀 안 건드림 */}

      {/* 이름 */}
      <label className={`${styles.label} ${styles.labelName}`} htmlFor="name">
        이름
      </label>
      <input
        type="text"
        id="name"
        className={`${styles.inputField} ${styles.inputName}`}
        required
      />

      {/* 아이디 */}
      <label className={`${styles.label} ${styles.labelId}`} htmlFor="id">
        아이디
      </label>
      <input
        type="text"
        id="id"
        className={`${styles.inputField} ${styles.inputId}`}
        required
      />

      {/* 비밀번호 */}
      <label className={`${styles.label} ${styles.labelPw}`} htmlFor="password">
        비밀번호
      </label>
      <input
        type="password"
        id="password"
        className={`${styles.inputField} ${styles.inputPw}`}
        required
      />

      {/* 비밀번호 확인 */}
      <label
        className={`${styles.label} ${styles.labelPwConfirm}`}
        htmlFor="passwordConfirm"
      >
        비밀번호 확인
      </label>
      <input
        type="password"
        id="passwordConfirm"
        className={`${styles.inputField} ${styles.inputPwConfirm}`}
        required
      />

      {/* 이메일 */}
      <label
        className={`${styles.label} ${styles.labelEmail}`}
        htmlFor="emailPart1"
      >
        이메일
      </label>
      <div className={styles.emailGroup}>
        <input
          type="text"
          id="emailPart1"
          className={styles.inputEmailPart1}
          placeholder="아이디"
        />
        <span className={styles.atSymbol}>@</span>
        <input
          type="text"
          id="emailPart2"
          className={styles.inputEmailPart2}
          placeholder="도메인"
        />
      </div>

      {/* 휴대폰 번호 */}
      <label
        className={`${styles.label} ${styles.labelPhone}`}
        htmlFor="phonePart2"
      >
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

      {/* 6. 버튼 */}
      <button
        type="button"
        onClick={handleSubmit}
        className={styles.submitButton}
      >
        회원 가입
      </button>
    </div>
  );
}
