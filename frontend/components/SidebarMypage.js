'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './SidebarMypage.module.css';
import SideBarFooter from '@/components/SideBarFooter';
import { useRouter } from "next/navigation";

export default function SidebarMypage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const getFallback = () =>
    typeof window !== 'undefined'
      ? `${window.location.origin}/profile-circle.svg`
      : '/profile-circle.svg';
  const fallback = getFallback();
  const [profileSrc, setProfileSrc] = useState(fallback);
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogoClick = () => {
    setShowLogoutModal(true);
  };
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.push("/");
  };
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };  

  const normalizeProfile = (raw) => {
    if (!raw) return null;
    if (typeof raw === 'string' && raw.includes('profile-circle.svg')) return getFallback();
    if (/^https?:\/\//i.test(raw)) return raw;
    let path = raw.toString().trim();
    if (!path || path === 'null' || path === 'None') return null;
    path = path.replace(/^\/+/, '');
    const origin = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:8000';
    return `${origin}/${path}`;
  };

  const handleProfileError = () => {
    const fb = getFallback();
    setProfileSrc(fb);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('mypageProfileImage', fb);
      window.dispatchEvent(new CustomEvent('mypageProfileImageChange', { detail: fb }));
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('mypageProfileImage');
    const normalized = normalizeProfile(stored) || fallback;
    setProfileSrc(normalized);
    if (normalized !== stored) {
      window.localStorage.setItem('mypageProfileImage', normalized);
      window.dispatchEvent(new CustomEvent('mypageProfileImageChange', { detail: normalized }));
    }

    const handler = (e) => {
      if (e.detail) {
        const nextSrc = normalizeProfile(e.detail) || fallback;
        setProfileSrc(nextSrc);
      }
    };
    window.addEventListener('mypageProfileImageChange', handler);
    return () => window.removeEventListener('mypageProfileImageChange', handler);
  }, []);
  const menus = [
    { text: '내 정보', href: '/student/mypage?tab=info', key: 'info' },
    { text: 'My Level', href: '/student/mypage?tab=level', key: 'level' },
    { text: '1:1 상담', href: '/student/mypage?tab=counsel', key: 'counsel' },
    { text: '수업 일정', href: '/student/mypage?tab=schedule', key: 'schedule' },
  ];

  const activeTab = menus.some((m) => m.key === tabParam) ? tabParam : 'info';

  return (
    <>
    <nav className={styles.sidebar}>
      <div className={styles.sidebarGroup}>
        <div 
          className={styles.sidebarTop}
          onClick={handleLogoClick}
          style={{cursor: "pointer"}}
        >
          <div className={styles.logo}>
            <Image src="/doro-logo.svg" alt="DORO" width={147} height={38} priority />
          </div>
          <div className={styles.profileWrap}>
            <Image
              src={profileSrc || fallback}
              alt="프로필"
              width={184}
              height={184}
              className={styles.profileImage}
              onError={handleProfileError}
            />
          </div>
        </div>

        <div className={styles.titleRow}>
          <Image src="/man.svg" alt="마이 페이지" width={25} height={32} />
          <h2 className={styles.title}>마이 페이지</h2>
        </div>

        <ul className={styles.menuList}>
          {menus.map((menu) => {
            const isActive = activeTab === menu.key;
            return (
              <li key={menu.key} className={`${styles.menuItem} ${isActive ? styles.active : ''}`}>
                <Link href={menu.href} className={styles.menuLink}>
                  <span className={styles.menuDot} />
                  {menu.text}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <SideBarFooter />
    </nav>
    {showLogoutModal && (
      <div className={styles.modalOverlay} onClick={handleCancelLogout}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div>
              <p className={styles.modalTitle}>로그아웃</p>
              <p className={styles.modalDesc}>정말 로그아웃 하시겠습니까?</p>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={handleCancelLogout}>취소</button>
              <button className={styles.confirmBtn} onClick={handleConfirmLogout}>확인</button>
            </div>
          </div>
      </div>
    )}
  </>    
  );
}
