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

  const [chatMessages, setChatMessages] = useState(FAKE_TEAMS[0]?.chatMessages || []);

  const addFile = (file) => {
    setFiles((prev) => [file, ...prev]);
  };

  const addChatMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      sender: "나",
      text: text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setChatMessages((prev) => [...prev, newMessage]);
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