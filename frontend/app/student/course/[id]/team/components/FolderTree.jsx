'use client';

import { useState, useRef, useEffect } from "react";
import styles from "../team.module.css";
import Image from "next/image";
import Link from "next/link";

export default function FolderTree({ courseId }) {
  const inputRef = useRef(null);

  const [folders, setFolders] = useState([
    {
      id: 1,
      name: "회의록",
      isOpen: true,
      items: [
        { id: 101, title: "1일차 아이디어 회의" },
        { id: 102, title: "2일차 역할 분담" },
      ],
    },
    {
      id: 2,
      name: "자료조사",
      isOpen: false,
      items: [{ id: 201, title: "유사 서비스 분석" }],
    },
  ]);

  const [addingState, setAddingState] = useState({
    type: null,
    targetId: null,
  });

  const [inputValue, setInputValue] = useState("");

  // 드래그 상태
  const dragItem = useRef({ folderIdx: null, itemIdx: null, type: null });
  const dragOverItem = useRef({ folderIdx: null, itemIdx: null, type: null });
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => {
    if (addingState.type && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingState]);

  // --- 드래그 핸들러 ---
  const handleDragStart = (e, folderIdx, itemIdx, type) => {
    e.stopPropagation();
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

  const handleSort = () => {
    setDragOverId(null);

    const source = dragItem.current;
    const dest = dragOverItem.current;

    if (source.folderIdx === null || dest.folderIdx === null) return;

    // 폴더 재정렬
    if (source.type === "folder" && dest.type === "folder") {
      if (source.folderIdx === dest.folderIdx) return;

      let _folders = [...folders];
      const draggedFolder = _folders[source.folderIdx];
      _folders.splice(source.folderIdx, 1);
      _folders.splice(dest.folderIdx, 0, draggedFolder);
      setFolders(_folders);
    }

    // 페이지 이동
    else if (source.type === "page") {
      let _folders = [...folders];
      const sourceItems = _folders[source.folderIdx].items;
      const draggedItem = sourceItems[source.itemIdx];
      sourceItems.splice(source.itemIdx, 1);

      if (dest.type === "page") {
        const destItems = _folders[dest.folderIdx].items;
        destItems.splice(dest.itemIdx, 0, draggedItem);
        _folders[dest.folderIdx].isOpen = true;
      } else if (dest.type === "folder") {
        const destItems = _folders[dest.folderIdx].items;
        destItems.push(draggedItem);
        _folders[dest.folderIdx].isOpen = true;
      }

      setFolders(_folders);
    }

    dragItem.current = { folderIdx: null, itemIdx: null, type: null };
    dragOverItem.current = { folderIdx: null, itemIdx: null, type: null };
  };

  // --- 폴더 & 페이지 추가 ---
  const toggleFolder = (folderId) => {
    setFolders(
      folders.map((f) =>
        f.id === folderId ? { ...f, isOpen: !f.isOpen } : f
      )
    );
  };

  const startAdding = (type, targetId = null) => {
    if (type === "page" && targetId) {
      setFolders(
        folders.map((f) =>
          f.id === targetId ? { ...f, isOpen: true } : f
        )
      );
    }
    setAddingState({ type, targetId });
    setInputValue("");
  };

  const cancelAdding = () => {
    setAddingState({ type: null, targetId: null });
    setInputValue("");
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      if (!inputValue.trim()) return cancelAdding();

      if (addingState.type === "folder") {
        setFolders([
          ...folders,
          { id: Date.now(), name: inputValue, isOpen: true, items: [] },
        ]);
      } else if (addingState.type === "page") {
        setFolders(
          folders.map((f) =>
            f.id === addingState.targetId
              ? {
                  ...f,
                  items: [...f.items, { id: Date.now(), title: inputValue }],
                }
              : f
          )
        );
      }

      cancelAdding();
    } else if (e.key === "Escape") {
      cancelAdding();
    }
  };

  return (
    <div className={styles.notionTreeBox} onDragOver={handleDragOver}>
      {folders.map((folder, fIndex) => (
        <div
          key={folder.id}
          className={styles.folderGroup}
          draggable
          onDragStart={(e) => handleDragStart(e, fIndex, null, "folder")}
          onDragEnter={(e) =>
            handleDragEnter(e, fIndex, null, "folder", folder.id)
          }
          onDragEnd={handleSort}
          onDragOver={handleDragOver}
        >
          {/* 폴더 헤더 */}
          <div
            className={`${styles.infoRow} ${
              dragOverId === folder.id ? styles.dragOverItem : ""
            }`}
            onClick={() => toggleFolder(folder.id)}
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

          {/* 내부 아이템 */}
          {folder.isOpen && (
            <div className={styles.subListContainer}>
              {folder.items.map((item, iIndex) => (
                <Link
                  key={item.id}
                  href={`/student/course/${courseId}/team/meeting/${item.id}?title=${encodeURIComponent(
                    item.title
                  )}`}
                  className={`${styles.subInfoRowLink} ${
                    dragOverId === item.id ? styles.dragOverItem : ""
                  }`}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, fIndex, iIndex, "page")
                  }
                  onDragEnter={(e) =>
                    handleDragEnter(e, fIndex, iIndex, "page", item.id)
                  }
                  onDragEnd={handleSort}
                  onDragOver={handleDragOver}
                >
                  <Image
                    src="/team-note.svg"
                    alt="Page"
                    width={20}
                    height={16}
                    style={{ opacity: 0.5, marginRight: "10px" }}
                  />
                  <span>{item.title}</span>
                </Link>
              ))}

              {addingState.type === "page" &&
                addingState.targetId === folder.id && (
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

      {/* 폴더 추가 */}
      {addingState.type === "folder" && (
        <div className={styles.infoRow}>
          <Image src="/down.svg" width={20} height={20} alt="Arrow" />
          <Image
            src="/team-note.svg"
            width={25}
            height={20}
            alt="Folder"
            className={styles.folderIconWrapper}
          />
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
        <button
          className={styles.rootAddButton}
          onClick={() => startAdding("folder")}
        >
          + 폴더 추가
        </button>
      </div>
    </div>
  );
}
