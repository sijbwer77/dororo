// app/signup/form/page.js

'use client';
import { useSearchParams, useRouter } from 'next/navigation'; // (수정) useRouter 추가
import styles from '../signup.module.css'; // signup.module.css 사용
import Image from 'next/image';

export default function SignupFormPage() {
  const router = useRouter(); // (추가) useRouter 훅 사용
  const searchParams = useSearchParams(); 
  const role = searchParams.get('role'); // student 또는 admin

  const roleName = role === 'student' ? '학생/학부모' : '매니저';

  const handleSubmit = (e) => {
    // 실제 회원가입 로직 (e.g., 입력값 검증 및 API 호출)
    console.log(`${roleName} 역할로 회원가입 시도`);
    
    // (수정) alert 대신 사용자 정의 모달을 사용하거나, 바로 이동하는 것이 좋습니다.
    // 여기서는 alert 후 바로 이동합니다.
    alert(`회원가입이 완료되었습니다.`);
    
    // (수정) 회원가입 완료 후 로그인 페이지인 루트 경로로 이동
    router.push('/'); 
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

      {/* 3. 제목 ('회원정보입력') - 역할에 따라 텍스트를 추가합니다. */}
      <h1 className={styles.title}>
        {roleName} - 회원정보입력
      </h1>
      
      {/* 4. 배경 및 구분선 */}
      <div className={styles.labelBackground}></div>

      <div className={`${styles.horizontalLine} ${styles.line1}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line2}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line3}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line4}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line5}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line6}`}></div>
      <div className={`${styles.horizontalLine} ${styles.line7}`}></div>

      {/* 5. 폼 요소들 */}
        
        {/* 이름 */}
        <label className={`${styles.label} ${styles.labelName}`} htmlFor="name">이름</label>
        <input type="text" id="name" className={`${styles.inputField} ${styles.inputName}`} required />

        {/* 아이디 */}
        <label className={`${styles.label} ${styles.labelId}`} htmlFor="id">아이디</label>
        <input type="text" id="id" className={`${styles.inputField} ${styles.inputId}`} required />

        {/* 비밀번호 */}
        <label className={`${styles.label} ${styles.labelPw}`} htmlFor="password">비밀번호</label>
        <input type="password" id="password" className={`${styles.inputField} ${styles.inputPw}`} required />

        {/* 비밀번호 확인 */}
        <label className={`${styles.label} ${styles.labelPwConfirm}`} htmlFor="passwordConfirm">비밀번호 확인</label>
        <input type="password" id="passwordConfirm" className={`${styles.inputField} ${styles.inputPwConfirm}`} required />

        {/* 이메일 (Group 302) */}
        <label className={`${styles.label} ${styles.labelEmail}`} htmlFor="emailPart1">이메일</label>
        <div className={styles.emailGroup}>
          <input type="text" id="emailPart1" className={styles.inputEmailPart1} placeholder="아이디" required />
          <span className={styles.atSymbol}>@</span>
          <input type="text" id="emailPart2" className={styles.inputEmailPart2} placeholder="도메인" required />
        </div>

        {/* 휴대폰 번호 (Group 301) */}
        <label className={`${styles.label} ${styles.labelPhone}`} htmlFor="phonePart2">휴대폰 번호</label>
        <div className={styles.phoneGroup}>
          <span className={styles.phonePrefix}>010</span>
          <span className={styles.phoneDash}>-</span>
          <input type="text" id="phonePart2" className={styles.inputPhonePart} maxLength="4" required />
          <span className={styles.phoneDash}>-</span>
          <input type="text" id="phonePart3" className={styles.inputPhonePart} maxLength="4" required />
        </div>

        {/* 6. 버튼 ('회원 가입 완료') */}
        <button type="button" onClick={handleSubmit} className={styles.submitButton}>
          회원 가입
        </button>
    </div>
  );
}