'use client';

import Sidebar from '@/components/Sidebar';
import styles from './mypage.module.css';

export default function MyPageLayout({ children }) {
  return (
    <div className={styles.pageLayout}>
      <Sidebar variant="mypage" />
      {children}
    </div>
  );
}
