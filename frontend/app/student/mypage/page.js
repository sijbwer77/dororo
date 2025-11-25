'use client'; 

import { useState } from 'react'; 
import styles from "./mypage.module.css";
import Image from "next/image"; 
import SideBarFooter from "@/components/SideBarFooter.js"; 
import { FAKE_USER_DATA } from "@/data/mock-user.js"; 

const myPageSidebarMenus = [
  { text: "내 정보", active: true },
  { text: "My Level" },
  { text: "1:1 상담" },
  { text: "수업 일정" },
];

export default function MyPage() {
  
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(FAKE_USER_DATA);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };
  
  if (!userData) {
    return (
      <div className={styles.pageLayout}>
        <main className={styles.mainContent}>
          <h1>로딩 중이거나 데이터를 불러오는 데 실패했습니다...</h1>
          <p>(data/mock-user.js 파일에 export const FAKE_USER_DATA가 있는지 확인하세요)</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageLayout}>
      
      {/* 1. 왼쪽: 마이페이지 전용 사이드바 */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <Image src="/doro-logo.svg" alt="DORO 로고" width={147} height={38}/>
          </div>
          <div className={styles.profileIcon}>
            <Image src="/profile-circle.svg" alt="프로필 아이콘" width={184} height={184}/>
          </div>
        </div>
        <div className={styles.sidebarTitleContainer}>
          <div className={styles.sidebarTitleIcon}>
             <Image src="/man.svg" alt="마이페이지 아이콘" width={25} height={32}/>
          </div>
          <h2 className={styles.sidebarTitle}>마이 페이지</h2>
        </div>
        
        {/* '점' 아이콘으로 수정된 메뉴 */}
        <ul className={styles.sidebarMenu}>
          {myPageSidebarMenus.map((menu) => (
            <li key={menu.text} className={`${styles.menuItem} ${menu.active ? styles.active : ""}`}>
              <div className={styles.menuIcon}>
                <span className={styles.menuIconDot}></span> {/* ⬅️ '점' 아이콘 */}
              </div>
              {menu.text}
            </li>
          ))}
        </ul>
        <SideBarFooter />
      </nav>

      {/* 2. 오른쪽: 메인 콘텐츠 (개인 정보) */}
      <main className={styles.mainContent}>
        
        <header className={styles.profileHeader}>
          <Image src="/profile-circle.svg" alt="프로필 아이콘" width={246} height={246}/>
          <h1 className={styles.profileName}>{userData.name}</h1>
        </header>

        <section className={styles.infoSection}>
          <div className={styles.infoTitleBar}>
            <h2 className={styles.infoTitle}>개인 정보</h2>
            
            <div className={styles.pencilIcon} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <Image
                  src="/save.svg" 
                  alt="저장"
                  width={24} 
                  height={24} 
                />
              ) : (
                <Image
                  src="/pencil.svg" 
                  alt="편집"
                  width={24} 
                  height={24} 
                />
              )}
            </div>
          </div>
          <div className={styles.titleLine}></div>

          <div className={styles.infoGrid}>
            <span className={styles.infoLabel}>이름</span>
            {isEditing ? (
              <input name="name" className={styles.infoInput} value={userData.name} onChange={handleInputChange} />
            ) : (
              <span className={styles.infoValue}>{userData.name}</span>
            )}
            <div className={styles.infoLine}></div>

            <span className={styles.infoLabel}>소속</span>
            {isEditing ? (
              <input name="organization" className={styles.infoInput} value={userData.organization} onChange={handleInputChange} />
            ) : (
              <span className={styles.infoValue}>{userData.organization}</span>
            )}
            <div className={styles.infoLine}></div>

            <span className={styles.infoLabel}>ID</span>
            <span className={styles.infoValue}>{userData.username}</span>
            <div className={styles.infoLine}></div>

            <span className={styles.infoLabel}>PW</span>
            {isEditing ? (
              <input name="password" type="password" className={styles.infoInput} placeholder="새 비밀번호" />
            ) : (
              <span className={styles.infoValue}>********</span>
            )}
            <div className={styles.infoLine}></div>

            <span className={styles.infoLabel}>e-mail</span>
            {isEditing ? (
              <input name="email" type="email" className={styles.infoInput} value={userData.email} onChange={handleInputChange} />
            ) : (
              <span className={styles.infoValue}>{userData.email}</span>
            )}
          </div>
          <div className={styles.bottomLine}></div>
        </section>

      </main>
    </div>
  );
}