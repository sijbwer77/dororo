'use client';

import Sidebar from "@/components/Sidebar";
import { useTeamData } from "./teamContext";
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

  const { files, chatMessages, addFile, addChatMessage } = useTeamData();

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

  return (
    <div className={styles.pageLayout}>
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        {/* --- 1) 로딩 상태 --- */}
        {loadingGroup && (
          <GroupEmptyNotice message="팀 정보를 불러오는 중입니다..." showHelp={false} />
        )}

        {/* --- 2) 그룹 없음 --- */}
        {!loadingGroup && !myGroup && (
          <GroupEmptyNotice message="아직 팀에 배정되지 않았습니다." showHelp={true} />
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
              
              {/* Chat / Upload 전환 버튼 UI */}
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

              {/* 패널 렌더링 */}
              <div className={styles.workContent}>
                {activeTab === "chat" && (
                  <ChatPanel
                    chatMessages={chatMessages}
                    addChatMessage={addChatMessage}
                  />
                )}

                {activeTab === "upload" && (
                  <UploadPanel
                    files={files}
                    addFile={addFile}
                  />
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
