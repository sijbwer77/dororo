'use client';

import { useState, useEffect } from "react";
import styles from "../team.module.css";
import Image from "next/image";

export default function FolderTree({ courseId, groupId }) {
  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  // 새 블록 입력 상태
  const [newType, setNewType] = useState("page");
  const [newContent, setNewContent] = useState("");

  // 공통 로더: parentId 없으면 root, 있으면 해당 노드 기준 children
  const loadNode = async (parentId) => {
    if (!groupId) return;
    setLoading(true);

    try {
      let url = `http://localhost:8000/api/group/${groupId}/documents/`;
      if (parentId !== undefined && parentId !== null) {
        url += `?parent_id=${parentId}`;
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        console.error("loadNode error", res.status);
        return;
      }
      const data = await res.json(); // { parent, children }

      setParent(data.parent);
      setChildren(data.children || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 최초 진입 시: 그룹의 root 기준으로 로드
  useEffect(() => {
    if (groupId) {
      loadNode(undefined);
    }
  }, [groupId]);

  // 상위로 이동
  const handleGoUp = () => {
    if (!parent || parent.parent_id == null) return;
    loadNode(parent.parent_id);
  };

  // 자식 노드 클릭 → 그 노드를 기준으로 다시 children 로드
  const handleChildClick = (child) => {
    loadNode(child.id);
  };

  // 현재 parent 밑에 새 블록 추가
  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!parent || !newContent.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/group/${groupId}/documents/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_id: parent.id,
            block_type: newType,
            content: newContent,
          }),
        }
      );

      if (!res.ok) {
        console.error("add block error", res.status);
        return;
      }

      setNewContent("");
      // 현재 parent 다시 로드
      loadNode(parent.id);
    } catch (err) {
      console.error(err);
    }
  };

  // 블록 삭제
  const handleDeleteChild = async (childId, e) => {
    e.stopPropagation(); // 클릭 시 이동 막기

    try {
      const res = await fetch(
        `http://localhost:8000/api/group/documents/${childId}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (res.status !== 204 && !res.ok) {
        console.error("delete block error", res.status);
        return;
      }

      // 현재 parent 다시 로드
      if (parent) {
        loadNode(parent.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!groupId) {
    return <div className={styles.notionTreeBox}>그룹 정보 없음</div>;
  }

  return (
    <div className={styles.notionTreeBox}>
      {/* 로딩 표시 */}
      {loading && <div>불러오는 중...</div>}

      {/* 현재 parent 정보 */}
      {!loading && parent && (
        <>
          <div className={styles.infoRow}>
            <button
              className={styles.hoverAddButton}
              disabled={parent.parent_id == null}
              onClick={handleGoUp}
            >
              ↑
            </button>

            <Image
              src="/team-note.svg"
              width={25}
              height={20}
              alt="Node"
              className={styles.folderIconWrapper}
            />

            <span className={styles.rowText}>
              [{parent.block_type}] {parent.content || "루트"}
            </span>
          </div>

          {/* children 리스트 */}
          <div className={styles.subListContainer}>
            {children.length === 0 && (
              <div className={styles.subInfoRowLink}>
                <span>자식 노드 없음</span>
              </div>
            )}

            {children.map((child) => (
              <div key={child.id} className={styles.subInfoRowLink}>
                <button
                  style={{ display: "flex", alignItems: "center", flex: 1 }}
                  onClick={() => handleChildClick(child)}
                >
                  <Image
                    src="/team-note.svg"
                    alt="Node"
                    width={20}
                    height={16}
                    style={{ opacity: 0.5, marginRight: "10px" }}
                  />
                  <span>
                    [{child.block_type}] {child.content || "(제목 없음)"}
                  </span>
                </button>
                <button
                  className={styles.hoverAddButton}
                  onClick={(e) => handleDeleteChild(child.id, e)}
                >
                  ✕
                </button>
              </div>
            ))}

            {/* 새 블록 추가 폼 */}
            {parent && (
              <form
                onSubmit={handleAddBlock}
                className={styles.subInfoRowLink}
                style={{ marginTop: "8px" }}
              >
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{ marginRight: "8px" }}
                >
                  <option value="page">page</option>
                  <option value="text">text</option>
                  <option value="toggle">toggle</option>
                  <option value="divider">divider</option>
                </select>
                <input
                  type="text"
                  placeholder="새 블록 내용"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  style={{ flex: 1, marginRight: "8px" }}
                />
                <button type="submit" className={styles.hoverAddButton}>
                  +
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
