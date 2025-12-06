'use client';

import { useState } from "react";
import styles from "../team.module.css";

export default function ChatPannel({ chatMessages, addChatMessage }) {
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!chatInput.trim()) return;
      addChatMessage(chatInput);
      setChatInput("");
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesArea}>
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
