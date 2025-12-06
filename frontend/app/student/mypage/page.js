"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./mypage.module.css";
import InfoSection from "./infosection/InfoSection";
import MyLevelSection from "./mylevel/MyLevelSection";
import CounselSection from "./counsel/CounselSection";
import ScheduleSection from "./schedule/ScheduleSection";
import { apiFetch } from "@/lib/api";

const TABS = [
  { text: "내 정보", key: "info" },
  { text: "My Level", key: "level" },
  { text: "1:1 상담", key: "counsel" },
  { text: "수업 일정", key: "schedule" },
];

export default function MyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const searchParams = useSearchParams();
  const activeTab =
    TABS.some((t) => t.key === searchParams.get("tab"))
      ? searchParams.get("tab")
      : "info";

  // -------------------------------
  // 1) 유저 정보 최초 로드
  // -------------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiFetch("/api/user/me/");

        setUserData({
          // 읽기 전용 데이터
          username: data.username,
          email: data.email,
          role: data.role === "SP" ? "학생/학부모" : "매니저",

          // 수정 가능한 데이터
          nickname: data.nickname,
          phone_number: data.phone_number,
          solvedAc: data.solvedac_handel || "",

          // 프로필 이미지 (지금은 그대로 유지) //나중에 API 따로 하나 만들기
          profileImage: data.profile_image
            ? `http://localhost:8000/${data.profile_image}`
            : "/profile-circle.svg",
        });
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    }

    fetchUser();
  }, []);

  // -------------------------------
  // 2) 저장하기 (nickname, phone_number, solvedAc 만 PATCH)
  // -------------------------------
  const saveChanges = async () => {
    try {
      const updated = await apiFetch("/api/user/me/", {
        method: "PATCH",
        body: JSON.stringify({
          nickname: userData.nickname,
          phone_number: userData.phone_number,
          solvedAc: userData.solvedAc, // backend에서 solvedac_handel 로 매핑
        }),
      });

      setUserData((prev) => ({
        ...prev,
        nickname: updated.nickname,
        phone_number: updated.phone_number,
        solvedAc: updated.solvedac_handel,
      }));

      setIsEditing(false);
    } catch (err) {
      console.error("업데이트 실패:", err);
    }
  };

  // -------------------------------
  // 3) 입력 변경 처리
  // -------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // username, email, organization, role 등은 수정 불가 → 무시
    if (!["nickname", "phone_number", "solvedAc"].includes(name)) {
      return;
    }

    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  if (!userData) {
    return <main className={styles.mainContent}>불러오는 중...</main>;
  }

  return (
    <main className={styles.mainContent}>
      {activeTab === "info" && (
        <InfoSection
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          userData={userData}
          handleInputChange={handleInputChange}
          saveChanges={saveChanges}
        />
      )}

      {activeTab === "level" && <MyLevelSection />}
      {activeTab === "counsel" && <CounselSection />}
      {activeTab === "schedule" && <ScheduleSection />}
    </main>
  );
}
