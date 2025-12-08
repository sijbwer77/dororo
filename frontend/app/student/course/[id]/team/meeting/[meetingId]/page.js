'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./meetingDetail.module.css";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar.js";
import { useTeamData } from "../../teamContext";

const API_BASE = "http://localhost:8000";

// 개별 블록 컴포넌트
const Block = ({
  block,
  index,
  updateContent,
  saveBlock,
  addEmptyAfter,
  deleteBlock,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  isDragOver,
  onContextMenu,
}) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== block.content) {
      contentRef.current.innerText = block.content;
    }
  }, [block.content]);

  const handleInput = (e) => {
    updateContent(block.id, e.currentTarget.innerText);
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      saveBlock(block, index, { insertEmpty: true });
    }
    if (e.key === "Backspace" && block.content === "" && index !== 0) {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  return (
    <div
      className={`${styles.blockRow} ${isDragOver ? styles.dragOverItem : ""}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onContextMenu={(e) => onContextMenu(e, block)}
    >
      <div className={styles.dragHandle}>:::</div>

      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        className={`${styles.blockContent} ${
          block.type === "h2" ? styles.heading : styles.paragraph
        }`}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={() => saveBlock(block, index)}
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default function MeetingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id;
  const meetingId = params.meetingId;
  const meetingTitle = searchParams.get("title") || "제목 없음";

  const { files, chatMessages, addFile, addChatMessage } = useTeamData();
  const [activeTab, setActiveTab] = useState("chat");
  const [chatInput, setChatInput] = useState("");
  const fileInputRef = useRef(null);

  const [groupId, setGroupId] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [blocks, setBlocks] = useState([{ id: `local-${Date.now()}`, type: "p", content: "" }]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const dragItem = useRef();
  const dragOverItem = useRef();
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // 그룹 찾기
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/group/${courseId}/my-group/`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setGroupId(data.group?.id || null);
      } finally {
        setLoadingGroup(false);
      }
    };
    fetchGroup();
  }, [courseId]);

  const fetchBlocks = useCallback(async () => {
    if (!groupId || !meetingId) return;
    setLoadingBlocks(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/group/groups/${groupId}/pages/${meetingId}/`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setBlocks([{ id: `local-${Date.now()}`, type: "p", content: "" }]);
        return;
      }
      const data = await res.json();
      const flat = (data.children || []).map((c) => ({
        id: c.id,
        type: c.block_type === "text" ? "p" : c.block_type,
        content: c.content || "",
        order_index: c.order_index || 0,
      }));
      flat.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      setBlocks(flat.length ? flat : [{ id: `local-${Date.now()}`, type: "p", content: "" }]);
    } finally {
      setLoadingBlocks(false);
    }
  }, [groupId, meetingId]);

  // 블록 로드
  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // --- 블록 핸들러 ---
  const updateContent = (id, newContent) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)));

  const addEmptyAfter = (index) => {
    const newBlock = { id: `local-${Date.now()}`, type: "p", content: "" };
    setBlocks((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newBlock);
      return next;
    });
  };

  const deleteBlock = (id) =>
    setBlocks((prev) => (prev.length === 1 ? prev : prev.filter((b) => b.id !== id)));

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
    setDragOverIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const openContextMenu = (e, block) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      blockId: block.id,
    });
  };

  const handleDeleteBlock = async (blockId) => {
    setContextMenu(null);
    if (!blockId) return;

    const target = blocks.find((b) => b.id === blockId);
    if (!target) return;

    // 낙관적 제거
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== blockId);
      if (!next.length) {
        next.push({ id: `local-${Date.now()}`, type: "p", content: "" });
      }
      return next;
    });

    // 서버 삭제 (저장된 블록만)
    if (!String(blockId).startsWith("local")) {
      try {
        const res = await fetch(`${API_BASE}/api/group/pages/${blockId}/`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok && res.status !== 204) {
          const t = await res.text();
          console.error("delete block failed", res.status, t);
          // 재동기화로 복원 시도
          await fetchBlocks();
          return;
        }
        // 삭제 후 서버 상태 재동기화
        await fetchBlocks();
      } catch (err) {
        console.error("delete block error", err);
        await fetchBlocks();
      }
    }
  };

  const toServerType = (type) => {
    // UI에서는 "p"/"h2" 등을 쓰지만, 서버는 "text"만 허용
    if (type === "p" || type === "h2" || !type) return "text";
    return type;
  };

  const persistBlock = async (block, orderIndex = null) => {
    if (!groupId) return null;
    const payload = {
      block_type: toServerType(block.type),
      content: block.content || "",
    };
    if (orderIndex !== null) payload.order_index = orderIndex;

    try {
      // 새 블록 생성
      if (String(block.id).startsWith("local")) {
        const res = await fetch(`${API_BASE}/api/group/${groupId}/pages/${meetingId}/blocks/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.id;
      }

      // 기존 블록 업데이트
      const res = await fetch(`${API_BASE}/api/group/pages/${block.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) return block.id;
      return block.id;
    } catch (err) {
      console.error("persistBlock error", err);
      return block.id;
    }
  };

  // 드래그/정렬 시 현재 순서를 백엔드에 반영해 새로고침 후에도 유지
  const persistOrder = async (orderedBlocks) => {
    if (!groupId) return orderedBlocks;

    let orderIndex = 1;
    const nextBlocks = [];

    for (const block of orderedBlocks) {
      const hasContent = (block.content || "").trim().length > 0;
      if (!hasContent) {
        nextBlocks.push(block);
        continue;
      }

      const ensuredId = await persistBlock(block, orderIndex);
      nextBlocks.push({
        ...block,
        id: ensuredId || block.id,
        order_index: orderIndex,
      });
      orderIndex += 1;
    }

    const saved = nextBlocks.filter(
      (b) => !String(b.id).startsWith("local") && (b.content || "").trim()
    );

    if (saved.length) {
      try {
        const orders = saved.map((b) => ({
          id: b.id,
          order_index: b.order_index,
        }));

        await fetch(`${API_BASE}/api/group/${groupId}/pages/reorder/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ parent: meetingId, orders }),
        });
      } catch (err) {
        console.error("order persist error", err);
      }
    }

    setBlocks(nextBlocks);
    return nextBlocks;
  };

  const saveBlock = async (block, index, opts = {}) => {
    if (!block.content.trim()) return;
    const newId = await persistBlock(block, index + 1);
    setBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...block, id: newId || block.id };
      if (opts.insertEmpty) {
        next.splice(index + 1, 0, { id: `local-${Date.now()}`, type: "p", content: "" });
      }
      return next;
    });
  };

  const handleSort = async () => {
    setDragOverIndex(null);
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const current = dragItem.current;
    const over = dragOverItem.current;
    let _blocks = [...blocks];
    const dragged = _blocks[current];
    _blocks.splice(current, 1);
    _blocks.splice(over, 0, dragged);
    // 즉시 화면에 반영하고, 비동기로 순서/ID를 백엔드에 저장
    setBlocks(_blocks);
    await persistOrder(_blocks);

    dragItem.current = null;
    dragOverItem.current = null;
  };

  // 오른쪽 패널 핸들러
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      addFile({ id: Date.now(), name: selectedFile.name, url: objectUrl });
    }
    e.target.value = "";
  };
  const handleChatSubmit = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!chatInput.trim()) return;
      addChatMessage(chatInput);
      setChatInput("");
    }
  };

  if (loadingGroup) {
    return <div className={styles.pageLayout}>로딩 중...</div>;
  }

  if (!groupId) {
    return <div className={styles.pageLayout}>팀이 없습니다.</div>;
  }

  return (
    <div className={styles.pageLayout}>
      <Sidebar courseId={courseId} />

      <main className={styles.mainContent}>
        <section className={styles.meetingDetailSection}>
          <div className={styles.meetingHeaderBg}>
            <h1 className={styles.meetingTitle}>{meetingTitle}</h1>
          </div>
          <div className={styles.meetingStripe}></div>

          <div className={styles.meetingBody} onDragOver={handleDragOver}>
            {loadingBlocks && <div className={styles.msgSender}>블록 불러오는 중...</div>}
            {blocks.map((block, index) => (
              <Block
                key={block.id}
                index={index}
                block={block}
                isDragOver={dragOverIndex === index}
                updateContent={updateContent}
                saveBlock={saveBlock}
                addEmptyAfter={addEmptyAfter}
                deleteBlock={deleteBlock}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleSort}
                onDragOver={handleDragOver}
                onContextMenu={openContextMenu}
              />
            ))}

            <div className={styles.emptyArea} onClick={() => addEmptyAfter(blocks.length - 1)}>
              + 빈 공간을 클릭해 입력하세요
            </div>
          </div>
        </section>

        <section className={styles.rightPanel}>
          <div className={styles.tabButtons}>
            <button
              className={`${styles.tabCircle} ${styles.chatTab} ${activeTab === "chat" ? styles.active : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              <Image src="/chat.svg" alt="Chat" width={28} height={28} />
            </button>
            <button
              className={`${styles.tabCircle} ${styles.uploadTab} ${activeTab === "upload" ? styles.active : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              <Image src="/upload-icon.svg" alt="Upload" width={28} height={28} />
            </button>
          </div>
          <div className={styles.panelContent}>
            {activeTab === "upload" && (
              <div className={styles.uploadContainer}>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                <div className={styles.uploadHeader} onClick={handleUploadClick} style={{ cursor: "pointer" }}>
                  <Image src="/upload.svg" alt="Upload" width={60} height={60} />
                  <p className={styles.uploadGuideText}>파일을 업로드하세요</p>
                </div>
                <div className={styles.fileList}>
                  {files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileItemLink}
                    >
                      {file.name}
                    </a>
                  ))}
                </div>
                <div className={styles.pagination}>&lt; 1 2 3 &gt;</div>
              </div>
            )}
            {activeTab === "chat" && (
              <div className={styles.chatContainer}>
                <div className={styles.messagesArea}>
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.messageRow} ${msg.isMe ? styles.myMessage : styles.otherMessage}`}
                    >
                      {!msg.isMe && <div className={styles.msgSender}>{msg.sender}</div>}
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
            )}
          </div>
        </section>
      </main>

      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "white",
            border: "1px solid #ddd",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            borderRadius: "6px",
            zIndex: 10000,
            padding: "6px 10px",
            cursor: "pointer",
            minWidth: "90px",
            fontSize: "14px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteBlock(contextMenu.blockId);
          }}
        >
          삭제
        </div>
      )}
    </div>
  );
}
