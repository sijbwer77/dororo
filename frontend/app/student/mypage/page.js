'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './mypage.module.css';
import { FAKE_USER_DATA } from '@/data/mock-user.js';
import InfoSection from './infosection/InfoSection';
import MyLevelSection from './mylevel/MyLevelSection';
import CounselSection from './counsel/CounselSection';
import ScheduleSection from './schedule/ScheduleSection';

const TABS = [
  { text: '내 정보', key: 'info' },
  { text: 'My Level', key: 'level' },
  { text: '1:1 상담', key: 'counsel' },
  { text: '수업 일정', key: 'schedule' },
];

export default function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    ...FAKE_USER_DATA,
    profileImage: '/profile-circle.svg',
    solvedAc: FAKE_USER_DATA.solvedAc || '',
  });
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = TABS.some((t) => t.key === tabParam) ? tabParam : 'info';

  useEffect(() => {
    // 로컬 저장된 프로필 이미지가 있으면 로드
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('mypageProfileImage') : null;
    if (stored) {
      setUserData((prev) => ({ ...prev, profileImage: stored }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
    if (name === 'profileImage') {
      try {
        window.localStorage.setItem('mypageProfileImage', value);
        window.dispatchEvent(new CustomEvent('mypageProfileImageChange', { detail: value }));
      } catch (err) {
        // ignore storage errors (quota/SSR)
      }
    }
  };

  if (!userData) {
    return (
      <main className={styles.mainContent}>
        <h1>로딩 중이거나 데이터를 불러오는 데 실패했습니다...</h1>
        <p>(data/mock-user.js 파일에 export const FAKE_USER_DATA가 있는지 확인하세요)</p>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      {activeTab === 'info' && (
        <InfoSection
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          userData={userData}
          handleInputChange={handleInputChange}
        />
      )}

      {activeTab === 'level' && <MyLevelSection />}

      {activeTab === 'counsel' && <CounselSection />}

      {activeTab === 'schedule' && <ScheduleSection />}
    </main>
  );
}