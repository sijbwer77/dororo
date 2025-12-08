"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../team.module.css";

export default function ChatPanel({
  groupId,
  chatMessages,
  addChatMessage,
}) {
  const [chatInput, setChatInput] = useState("");
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // 1) 컴포넌트가 화면에 나타나면 WebSocket 연결
  useEffect(() => {
    if (!groupId) {
      console.warn("groupId가 없습니다. WebSocket을 열 수 없습니다.");
      return;
    }

    // 백엔드(daphne) 연결
    const wsUrl = `ws://localhost:8000/ws/group/${groupId}/`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== "chat_message") return;

        addChatMessage({
          id: data.id,
          sender: data.sender,
          text: data.text,
          time: data.time,
          isMe: data.is_me,
        });
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("WS closed");
    };

    ws.onerror = (err) => {
      console.error("WS error:", err);
    };

    // 컴포넌트가 언마운트 될 때 소켓 닫기
    return () => {
      ws.close();
    };
  }, [groupId]);  // 🔥 addChatMessage 절대 넣지 말기

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages.length]);

  // 2) 입력창에서 Enter 누르면 메시지 전송
  const handleChatSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const msg = chatInput.trim();
      if (!msg) return;

      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message: msg }));
      } else {
        console.warn("WebSocket not connected");
      }

      setChatInput("");
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea} ref={messagesContainerRef}>
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageRow} ${
              msg.isMe ? styles.myMessage : styles.otherMessage
            }`}
          >
            {!msg.isMe && (
              <div className={styles.msgSender}>{msg.sender}</div>
            )}
            <div className={styles.msgBubble}>{msg.text}</div>
            <span className={styles.msgTime}>{msg.time}</span>
          </div>
        ))}
      </div>

      <div className={styles.chatInputBox}>
        <input
          type="text"
          placeholder="Message"
          className={styles.chatInput}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleChatSubmit}
        />
      </div>
    </div>
  );
}
