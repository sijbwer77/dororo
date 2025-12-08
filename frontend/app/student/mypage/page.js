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
  const [profileFile, setProfileFile] = useState(null);
  const [profileReset, setProfileReset] = useState(false);
  const getFallback = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}/profile-circle.svg`
      : "/profile-circle.svg";
  const DEFAULT_PROFILE = getFallback();
  const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000";
  const searchParams = useSearchParams();
  const activeTab =
    TABS.some((t) => t.key === searchParams.get("tab"))
      ? searchParams.get("tab")
      : "info";

  const syncSidebarProfile = (url) => {
    if (typeof window === "undefined") return;
    const finalUrl = url || getFallback();
    window.localStorage.setItem("mypageProfileImage", finalUrl);
    window.dispatchEvent(
      new CustomEvent("mypageProfileImageChange", { detail: finalUrl })
    );
  };

  const normalizeProfile = (raw) => {
    if (!raw) return null;
    const str = raw.toString().trim();
    if (!str || str === "null" || str === "None") return null;
    if (str.includes("profile-circle.svg")) return getFallback();
    if (/^https?:\/\//i.test(str)) return str;
    const path = str.replace(/^\/+/, "");
    return `${apiOrigin}/${path}`;
  };

  // -------------------------------
  // 1) 유저 정보 최초 로드
  // -------------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiFetch("/api/user/me/");

        const profileUrl = normalizeProfile(data.profile_image);
        syncSidebarProfile(profileUrl);

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
          profileImage: profileUrl || getFallback(),
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
      const formData = new FormData();
      formData.append("nickname", userData.nickname || "");
      formData.append("phone_number", userData.phone_number || "");
      formData.append("solvedAc", userData.solvedAc || "");
      if (profileFile) {
        formData.append("profile_image", profileFile);
      } else if (profileReset) {
        formData.append("profile_image", "");
      }

      const updated = await apiFetch("/api/user/me/", {
        method: "PATCH",
        body: formData,
      });

      const normalizedProfile = normalizeProfile(updated.profile_image);

      setUserData((prev) => ({
        ...prev,
        nickname: updated.nickname,
        phone_number: updated.phone_number,
        solvedAc: updated.solvedac_handel,
        profileImage: normalizedProfile || getFallback(),
      }));

      syncSidebarProfile(normalizedProfile);
      setProfileFile(null);
      setProfileReset(false);
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

  const handleProfileSelect = (file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProfileFile(file);
    setProfileReset(false);
    setUserData((prev) => ({
      ...prev,
      profileImage: objectUrl,
    }));
  };

  const handleProfileReset = () => {
    setProfileFile(null);
    setProfileReset(true);
    setUserData((prev) => ({
      ...prev,
      profileImage: getFallback(),
    }));
    syncSidebarProfile(getFallback());
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
          onProfileSelect={handleProfileSelect}
          onProfileReset={handleProfileReset}
        />
      )}

      {activeTab === "level" && <MyLevelSection />}
      {activeTab === "counsel" && <CounselSection />}
      {activeTab === "schedule" && <ScheduleSection />}
    </main>
  );
}
