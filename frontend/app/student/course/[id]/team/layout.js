/* app/student/course/[id]/team/layout.js */
// 'use client'는 제거해도 됩니다. (TeamProvider가 이미 client component이므로)
import { TeamProvider } from './teamContext';

export default function TeamLayout({ children }) {
  return (
    <TeamProvider>
      {children}
    </TeamProvider>
  );
}