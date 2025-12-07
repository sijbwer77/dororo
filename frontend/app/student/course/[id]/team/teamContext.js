/* app/student/course/[id]/team/TeamContext.js */
'use client';

import { createContext, useState, useContext } from 'react';

const TeamContext = createContext();

export function TeamProvider({ children }) {
  // --- 파일 상태 ---
  const [files, setFiles] = useState([
    { id: 1, name: "기획서_v1.pdf", url: "#" },
    { id: 2, name: "자료조사.zip", url: "#" },
    { id: 3, name: "Doc 7.pdf", url: "#" },
  ]);

  const addFile = (file) => {
    setFiles((prev) => [file, ...prev]);
  };

  // --- 채팅 상태 ---
  const [chatMessages, setChatMessages] = useState([]);

  const addChatMessage = (msg) => {
    setChatMessages((prev) => {
      // 문자열만 넣는 옛날 방식: addChatMessage("안녕")
      if (typeof msg === "string") {
        const newMessage = {
          id: Date.now(),
          sender: "me",
          text: msg,
          time: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
        };
        return [...prev, newMessage];
      }

      // WebSocket 에서 객체로 들어오는 경우
      if (msg && typeof msg === "object") {
        return [...prev, msg];
      }

      // 이상한 값이면 무시
      return prev;
    });
  };

  return (
    <TeamContext.Provider
      value={{
        files,
        addFile,
        chatMessages,
        addChatMessage,
        setChatMessages,   // 👈 히스토리 세팅용으로 노출
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamData() {
  return useContext(TeamContext);
}
