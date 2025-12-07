/* app/student/course/[id]/team/TeamContext.js */
'use client';

import { createContext, useState, useContext } from 'react';
import { FAKE_TEAMS } from "@/data/mock-team.js";

const TeamContext = createContext();

export function TeamProvider({ children }) {
  
  const [files, setFiles] = useState([
     { id: 1, name: "기획서_v1.pdf", url: "#" },
     { id: 2, name: "자료조사.zip", url: "#" },
     { id: 3, name: "Doc 7.pdf", url: "#" },
  ]);

    const addFile = (file) => {
      setFiles((prev) => [file, ...prev]);
    };

  const [chatMessages, setChatMessages] = useState([]);

  const addChatMessage = (msg) => {
    setChatMessages((prev) => {
      // 1) 옛날처럼 문자열만 넣는 경우 (예: addChatMessage("안녕"))
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

      // 2) 지금처럼 웹소켓에서 이미 만들어진 객체를 넣는 경우
      if (msg && typeof msg === "object") {
        return [...prev, msg];
      }

      // 그 외 이상한 값이면 그냥 무시
      return prev;
    });
  };


  return (
    <TeamContext.Provider value={{ files, chatMessages, addFile, addChatMessage }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamData() {
  return useContext(TeamContext);
}