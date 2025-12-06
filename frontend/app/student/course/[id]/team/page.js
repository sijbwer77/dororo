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
        const res = await fetch(`http://localhost:8000/api/group/courses/${courseId}/my-group/`, {credentials: "include"});
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

        {/* 1) 로딩 상태 */}
        {loadingGroup && (
          <GroupEmptyNotice message="팀 정보를 불러오는 중입니다..." showHelp={false}/>
        )}

        {/* 2) 그룹 없음 */}
        {!loadingGroup && !myGroup && (
          <GroupEmptyNotice message="아직 팀에 배정되지 않았습니다." showHelp={true}/>
        )}

        {/* 3) 그룹 있음 → 정상 렌더링 */}
        {!loadingGroup && myGroup && (
          <>
            <section className={styles.teamListSection}>
              <FolderTree courseId={courseId} />
            </section>

            <section className={styles.teamWorkSection}>
              {activeTab === "chat" && (
                <ChatPanel chatMessages={chatMessages} addChatMessage={addChatMessage} />
              )}

              {activeTab === "upload" && (
                <UploadPanel files={files} addFile={addFile} />
              )}
            </section>
          </>
        )}

      </main>
    </div>
  );
}
