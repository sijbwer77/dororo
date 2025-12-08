'use client';

import Sidebar from "@/components/Sidebar";
import { TeamProvider, useTeamData } from "./teamContext";
import FolderTree from "./components/FolderTree";
import ChatPanel from "./components/ChatPanel";
import UploadPanel from "./components/UploadPanel";
import GroupEmptyNotice from "./components/GroupEmptyNotice";
import styles from "./team.module.css";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeamPage() {
  const params = useParams();
  const courseId = params.id;

  const [myGroup, setMyGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  // 👇 setChatMessages 추가로 꺼내오기
  const { chatMessages, addChatMessage, setChatMessages } =
    useTeamData();

  // 1) 내 그룹 정보 가져오기
  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/group/${courseId}/my-group/`,
          { credentials: "include" }
        );
        const data = await res.json();
        setMyGroup(data.group);
      } finally {
        setLoadingGroup(false);
      }
    }
    fetchGroup();
  }, [courseId]);

  // 2) 그룹이 정해지면, 그 그룹의 과거 메시지 불러오기
  useEffect(() => {
    if (!myGroup) return; // 아직 그룹 정보 없으면 스킵

    async function fetchMessages() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/group/${myGroup.id}/messages_load/`,
          { credentials: "include" }
        );
        if (!res.ok) {
          console.error("failed to load messages", res.status);
          return;
        }

        const data = await res.json(); // [{id, sender, text, time, is_me}, ...]

        const mapped = data.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          time: m.time,
          isMe: m.is_me,
        }));

        setChatMessages(mapped);   // 👈 히스토리 한 번에 세팅
      } catch (err) {
        console.error("load messages error:", err);
      }
    }

    fetchMessages();
  }, [myGroup, setChatMessages]);

  return (
    <TeamProvider groupId={myGroup?.id}>
      <div className={styles.pageLayout}>
        <Sidebar courseId={courseId} />

        <main className={styles.mainContent}>
          {/* --- 1) 로딩 상태 --- */}
          {loadingGroup && (
            <GroupEmptyNotice
              message="팀 정보를 불러오는 중입니다."
              showHelp={false}
            />
          )}

          {/* --- 2) 그룹 없음 --- */}
          {!loadingGroup && !myGroup && (
            <GroupEmptyNotice
              message="아직 팀에 배정되지 않았습니다."
              showHelp={true}
            />
          )}

          {/* --- 3) 그룹 있음 --- */}
          {!loadingGroup && myGroup && (
            <>
              {/* 좌측: notion */}
              <section className={styles.teamListSection}>
                <FolderTree courseId={courseId} />
              </section>

              {/* 우측: 작업 패널 */}
              <section className={styles.teamWorkSection}>
                <div className={styles.tabButtons}>
                  <button
                    className={`${styles.tabButton} ${activeTab === "chat" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("chat")}
                  >
                    <img src="/chat.svg" alt="chat" width={24} height={24} />
                  </button>

                  <button
                    className={`${styles.tabButton} ${activeTab === "upload" ? styles.activeTab : ""}`}
                    onClick={() => setActiveTab("upload")}
                  >
                    <img src="/upload-icon.svg" alt="upload" width={24} height={24} />
                  </button>
                </div>

                <div className={styles.workContent}>
                  {activeTab === "chat" && (
                    <ChatPanel
                      groupId={myGroup.id}
                      chatMessages={chatMessages}
                      addChatMessage={addChatMessage}
                    />
                  )}

                  {activeTab === "upload" && (
                    <UploadPanel
                      groupId={myGroup.id}
                    />
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </TeamProvider>
  );
}
