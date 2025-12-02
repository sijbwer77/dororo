// app/admin/components/AdminSidebar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../layout.module.css";


const MENUS = [
  { key: "dashboard", label: "대시보드", icon: "/admin_home.svg", path: "/admin" },
  { key: "notice",    label: "공지",     icon: "/admin_notification.svg", path: "/admin/notice" },
  { key: "message",   label: "메시지",   icon: "/admin_message.svg", path: "/admin/message" },
  { key: "course",    label: "강의 확인", icon: "/admin_course.svg", path: "/admin/course" },
  { key: "eval",      label: "강의평가", icon: "/chart-pie.svg", path: "/admin/eval" },
  { key: "counsel",   label: "상담",     icon: "/admin_talk.svg", path: "/admin/counsel" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>

      <nav className={styles.sidebarNav}>
        {MENUS.map((menu) => {
          const isActive =
            pathname === menu.path ||
            (menu.path !== "/admin" && pathname.startsWith(menu.path));

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
