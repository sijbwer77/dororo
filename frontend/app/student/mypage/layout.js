'use client';

import SidebarMypage from '@/components/SidebarMypage';
import styles from './mypage.module.css';

export default function MyPageLayout({ children }) {
  return (
    <div className={styles.pageLayout}>
      <SidebarMypage />
      {children}
    </div>
  );
}
