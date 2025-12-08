'use client';

import { useState, useRef, useEffect } from "react";
import styles from "../team.module.css";
import Image from "next/image";
import Link from "next/link";
import { useTeamData } from "../teamContext";

const API_BASE = "http://localhost:8000";
const ROOT_ID = "root";

export default function FolderTree({ courseId }) {
  const inputRef = useRef(null);
  const { groupId } = useTeamData();

  const [folders, setFolders] = useState([]);
  const [addingState, setAddingState] = useState({ type: null, targetId: null });
  const [inputValue, setInputValue] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  const dragItem = useRef({ folderIdx: null, itemIdx: null, type: null });
  const dragOverItem = useRef({ folderIdx: null, itemIdx: null, type: null });
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    if (addingState.type && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingState]);

  // 우클릭 메뉴 닫기
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // Load folder/page tree
  useEffect(() => {
    const fetchPages = async () => {
      if (!groupId) return;
      try {
        const res = await fetch(`${API_BASE}/api/group/${groupId}/pages/`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        const mapped = data
          .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
          .map((f) => ({
            id: f.id,
            name: f.name || "페이지",
            isOpen: true,
            items: (f.items || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
          }));
        setFolders(
          mapped.length
            ? mapped
            : [
                { id: ROOT_ID, name: "페이지", isOpen: true, items: [] },
              ]
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchPages();
  }, [groupId]);

  // Drag handlers
  const handleDragStart = (e, folderIdx, itemIdx, type) => {
    e.stopPropagation();
    try {
      e.dataTransfer.setData("text/plain", String(type));
    } catch (_) {}
    dragItem.current = { folderIdx, itemIdx, type };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, folderIdx, itemIdx, type, uniqueId) => {
    e.stopPropagation();
    dragOverItem.current = { folderIdx, itemIdx, type };
    setDragOverId(uniqueId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const openContextMenu = (e, payload) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      ...payload,
    });
  };

  const handleDelete = async () => {
    if (!contextMenu) return;
    const { type, folderId, itemId } = contextMenu;
    const targetId = type === "folder" ? folderId : itemId;

    // 루트는 삭제 불가
    if (!targetId || targetId === ROOT_ID) {
      setContextMenu(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/group/pages/${targetId}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204) {
        const txt = await res.text();
        console.error("삭제 실패", res.status, txt);
      }

      setFolders((prev) => {
        if (type === "folder") {
          return prev.filter((f) => f.id !== folderId);
        }
        return prev.map((f) =>
          f.id === folderId
            ? { ...f, items: (f.items || []).filter((it) => it.id !== itemId) }
            : f
        );
      });
    } catch (err) {
      console.error("삭제 오류", err);
    } finally {
      setContextMenu(null);
    }
  };

  const handleSort = async () => {
    setDragOverId(null);
    const source = dragItem.current;
    const dest = dragOverItem.current;
    if (source.folderIdx === null || dest.folderIdx === null) return;

    // Folder reorder
    if (source.type === "folder" && dest.type === "folder") {
      if (source.folderIdx === dest.folderIdx) return;
      let _folders = [...folders];
      const draggedFolder = _folders[source.folderIdx];
      _folders.splice(source.folderIdx, 1);
      _folders.splice(dest.folderIdx, 0, draggedFolder);
      setFolders(_folders);

      if (groupId) {
        const payload = _folders
          .filter((f) => f.id !== ROOT_ID)
          .map((f, idx) => ({ id: Number(f.id), order_index: idx + 1 }));
        try {
          const res = await fetch(`${API_BASE}/api/group/${groupId}/pages/reorder/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ parent: null, orders: payload }),
          });
          if (!res.ok) {
            const t = await res.text();
            console.error("폴더 reorder 실패", res.status, t);
          }
        } catch (err) {
          console.error("폴더 reorder 오류", err);
        }
      }
    }

    // Page move/reorder
    else if (source.type === "page") {
      let _folders = [...folders];
      const sourceItems = _folders[source.folderIdx]?.items || [];
      const draggedItem = sourceItems[source.itemIdx];

      // 드래그 정보가 꼬여 있으면 안전하게 종료
      if (!draggedItem) {
        dragItem.current = { folderIdx: null, itemIdx: null, type: null };
        dragOverItem.current = { folderIdx: null, itemIdx: null, type: null };
        return;
      }

      sourceItems.splice(source.itemIdx, 1);

      const destFolderId = _folders[dest.folderIdx].id;

      if (dest.type === "page") {
        const destItems = _folders[dest.folderIdx].items || [];
        destItems.splice(dest.itemIdx, 0, draggedItem);
      } else if (dest.type === "folder") {
        const destItems = _folders[dest.folderIdx].items || [];
        destItems.push(draggedItem);
      }

      setFolders(_folders);

      if (groupId) {
        const parentId = destFolderId === ROOT_ID ? null : destFolderId;
        const destPayload = _folders[dest.folderIdx].items.map((item, idx) => ({
          id: Number(item.id),
          order_index: idx + 1,
        }));
        try {
          const res = await fetch(`${API_BASE}/api/group/${groupId}/pages/reorder/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ parent: parentId, orders: destPayload }),
          });
          if (!res.ok) {
            const t = await res.text();
            console.error("페이지 이동/정렬 실패", res.status, t);
          }
          // 출발 폴더 정렬 (다른 폴더로 이동 시)
          if (source.folderIdx !== dest.folderIdx) {
            const sourcePayload = _folders[source.folderIdx].items.map((item, idx) => ({
              id: Number(item.id),
              order_index: idx + 1,
            }));
            await fetch(`${API_BASE}/api/group/${groupId}/pages/reorder/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                parent: _folders[source.folderIdx].id === ROOT_ID ? null : _folders[source.folderIdx].id,
                orders: sourcePayload,
              }),
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    dragItem.current = { folderIdx: null, itemIdx: null, type: null };
    dragOverItem.current = { folderIdx: null, itemIdx: null, type: null };
  };

  // Adders
  const startAdding = (type, targetId = null) => {
    if (type === "page" && targetId) {
      setFolders(folders.map((f) => (f.id === targetId ? { ...f, isOpen: true } : f)));
    }
    setAddingState({ type, targetId });
    setInputValue("");
  };

  const cancelAdding = () => {
    setAddingState({ type: null, targetId: null });
    setInputValue("");
  };

  const handleInputSubmit = async (e) => {
    if (e.key === "Enter") {
      if (!inputValue.trim()) return cancelAdding();

      if (addingState.type === "folder") {
        if (!groupId) return cancelAdding();
        try {
          const res = await fetch(`${API_BASE}/api/group/${groupId}/pages/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: inputValue, block_type: "folder" }),
          });
          if (!res.ok) {
            console.error("폴더 생성 실패", res.status);
          } else {
            const data = await res.json();
            setFolders([...folders, { id: data.id, name: data.name, isOpen: true, items: [] }]);
          }
        } catch (err) {
          console.error(err);
        }
        cancelAdding();
        return;
      }

      if (addingState.type === "page") {
        if (!groupId) return cancelAdding();
        try {
          const res = await fetch(`${API_BASE}/api/group/${groupId}/pages/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              title: inputValue,
              block_type: "page",
              parent_id: addingState.targetId === ROOT_ID ? null : addingState.targetId,
            }),
          });
          if (!res.ok) {
            console.error("페이지 생성 실패", res.status);
          } else {
            const data = await res.json();
            setFolders(
              folders.map((f) =>
                f.id === addingState.targetId
                  ? { ...f, items: [...f.items, { id: data.id, title: data.title, order_index: data.order_index }] }
                  : f
              )
            );
          }
        } catch (err) {
          console.error(err);
        }
        cancelAdding();
      }
    } else if (e.key === "Escape") {
      cancelAdding();
    }
  };

  const toggleFolder = (folderId) => {
    setFolders(folders.map((f) => (f.id === folderId ? { ...f, isOpen: !f.isOpen } : f)));
  };

  return (
    <div className={styles.notionTreeBox} onDragOver={handleDragOver}>
      {folders.map((folder, fIndex) => (
        <div
          key={folder.id}
          className={styles.folderGroup}
          draggable
          onDragStart={(e) => handleDragStart(e, fIndex, null, "folder")}
          onDragEnter={(e) => handleDragEnter(e, fIndex, null, "folder", folder.id)}
          onDragEnd={handleSort}
          onDragOver={handleDragOver}
        >
          <div
            className={`${styles.infoRow} ${dragOverId === folder.id ? styles.dragOverItem : ""}`}
            onClick={() => toggleFolder(folder.id)}
            onContextMenu={(e) => {
              if (folder.id !== ROOT_ID) {
                openContextMenu(e, { type: "folder", folderId: folder.id });
              }
            }}
          >
            <span className={styles.arrowIconWrapper}>
              {folder.isOpen ? (
                <Image src="/down.svg" width={20} height={20} alt="Open" />
              ) : (
                <Image src="/arrow-right.svg" width={20} height={20} alt="Close" />
              )}
            </span>

            <Image
              src="/team-note.svg"
              width={25}
              height={20}
              alt="Folder"
              className={styles.folderIconWrapper}
            />

            <span className={styles.rowText}>{folder.name}</span>

            <button
              className={styles.hoverAddButton}
              onClick={(e) => {
                e.stopPropagation();
                startAdding("page", folder.id);
              }}
            >
              +
            </button>
          </div>

          {folder.isOpen && (
            <div className={styles.subListContainer}>
              {(folder.items || []).filter(Boolean).map((item, iIndex) => (
                <Link
                  key={item.id}
                  href={`/student/course/${courseId}/team/meeting/${item.id}?title=${encodeURIComponent(item.title)}`}
                  className={`${styles.subInfoRowLink} ${dragOverId === item.id ? styles.dragOverItem : ""}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fIndex, iIndex, "page")}
                  onDragEnter={(e) => handleDragEnter(e, fIndex, iIndex, "page", item.id)}
                  onDragEnd={handleSort}
                  onDragOver={handleDragOver}
                  onContextMenu={(e) =>
                    openContextMenu(e, { type: "page", folderId: folder.id, itemId: item.id })
                  }
                >
                  <Image src="/team-note.svg" alt="Page" width={20} height={16} style={{ opacity: 0.5, marginRight: "10px" }} />
                  <span>{item.title}</span>
                </Link>
              ))}

              {addingState.type === "page" && addingState.targetId === folder.id && (
                <div className={styles.subInfoRowLink}>
                  <Image
                    src="/team-note.svg"
                    width={20}
                    height={16}
                    alt="Page"
                    style={{ opacity: 0.5, marginRight: "10px" }}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    placeholder="페이지 이름..."
                    className={styles.inlineInput}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputSubmit}
                    onBlur={cancelAdding}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {addingState.type === "folder" && (
        <div className={styles.infoRow}>
          <Image src="/down.svg" width={20} height={20} alt="Arrow" />
          <Image src="/team-note.svg" width={25} height={20} alt="Folder" className={styles.folderIconWrapper} />
          <input
            ref={inputRef}
            type="text"
            className={styles.inlineInput}
            placeholder="폴더 이름..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputSubmit}
            onBlur={cancelAdding}
          />
        </div>
      )}

      <div className={styles.rootAddArea}>
        <button className={styles.rootAddButton} onClick={() => startAdding("folder")}>
          + 폴더 추가
        </button>
      </div>

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
            zIndex: 9999,
            padding: "6px 10px",
            cursor: "pointer",
            minWidth: "80px",
            fontSize: "14px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          삭제
        </div>
      )}
    </div>
  );
}
