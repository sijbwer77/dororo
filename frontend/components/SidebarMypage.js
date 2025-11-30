'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './SidebarMypage.module.css';
import SideBarFooter from '@/components/SideBarFooter';

export default function SidebarMypage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [profileSrc, setProfileSrc] = useState('/profile-circle.svg');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('mypageProfileImage');
    if (stored) setProfileSrc(stored);

    const handler = (e) => {
      if (e.detail) setProfileSrc(e.detail);
    };
    window.addEventListener('mypageProfileImageChange', handler);
    return () => window.removeEventListener('mypageProfileImageChange', handler);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('mypageProfileImage');
    if (stored) setProfileSrc(stored);
  }, []);
  const menus = [
    { text: '내 정보', href: '/student/mypage?tab=info', key: 'info' },
    { text: 'My Level', href: '/student/mypage?tab=level', key: 'level' },
    { text: '1:1 상담', href: '/student/mypage?tab=counsel', key: 'counsel' },
    { text: '수업 일정', href: '/student/mypage?tab=schedule', key: 'schedule' },
  ];

  const activeTab = menus.some((m) => m.key === tabParam) ? tabParam : 'info';

  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarGroup}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <Image src="/doro-logo.svg" alt="DORO" width={147} height={38} priority />
          </div>
          <div className={styles.profileWrap}>
            <Image src={profileSrc} alt="프로필" fill sizes="184px" className={styles.profileImage} />
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
  );
}
