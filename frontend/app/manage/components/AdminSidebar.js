// app/admin/components/AdminSidebar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../layout.module.css";

const MENUS = [
  { key: "dashboard", label: "대시보드", icon: "/admin_home.svg", path: "/manage" },
  { key: "notice",    label: "공지",     icon: "/admin_notification.svg", path: "/manage/notice" },
  { key: "message",   label: "메시지",   icon: "/admin_message.svg", path: "/manage/message" },
  { key: "course",    label: "강의 확인", icon: "/admin_course.svg", path: "/manage/course" },
  { key: "eval",      label: "강의평가", icon: "/chart-pie.svg", path: "/manage/eval" },
  { key: "counsel",   label: "상담",     icon: "/admin_talk.svg", path: "/manage/counsel" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        {MENUS.map((menu) => {
          
          // ✅ 활성화 조건 정확히 수정된 부분
          const isActive =
            // 대시보드는 ONLY "/manage"에서만 활성화
            (menu.path === "/manage" && pathname === "/manage") ||
            // 나머지 메뉴는 해당 path로 시작할 때 활성화
            (menu.path !== "/manage" && pathname.startsWith(menu.path));

          return (
            <Link
              key={menu.key}
              href={menu.path}
              className={`${styles.sidebarItem} ${
                isActive ? styles.sidebarItemActive : ""
              }`}
            >
              <div className={styles.sidebarItemIcon}>
                <Image
                  src={menu.icon}
                  alt={menu.label}
                  width={26}
                  height={26}
                />
              </div>
              <div className={styles.sidebarItemLabel}>{menu.label}</div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
