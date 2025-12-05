// app/admin/notice/page.js
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./notice.manage.module.css";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function NoticeManagePage() {
  const router = useRouter();

  // 공지 목록 상태
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notices") || "[]");
    // 최근 작성한 공지가 위로 오도록 뒤집기
    setNotices(saved.reverse());
  }, []);

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // 체크박스 상태
  const [checkedItems, setCheckedItems] = useState({});
  const [checkAll, setCheckAll] = useState(false);

  const handleCheckAll = () => {
    setCheckedItems((prev) => {
      const newState = {};
      notices.forEach((_, idx) => {
        newState[idx] = !checkAll;
      });
      return newState;
    });
    setCheckAll(!checkAll);
  };

  // 삭제 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const [targetIndexes, setTargetIndexes] = useState([]);

  const openDeleteModal = () => {
    const selected = Object.keys(checkedItems)
      .filter((k) => checkedItems[k])
      .map((idx) => Number(idx));

    if (selected.length === 0) {
      alert("삭제할 공지를 선택하세요.");
      return;
    }

    setTargetIndexes(selected);

    if (selected.length === notices.length) {
      setTargetTitle("모든 공지");
    } else if (selected.length === 1) {
      setTargetTitle(notices[selected[0]].title);
    } else {
      setTargetTitle(`${selected.length}개의 공지`);
    }

    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    const newList = notices.filter((_, idx) => !targetIndexes.includes(idx));

    // 로컬스토리지에는 원래 저장 순서(작성 오래된 순)로 다시 저장
    const originalOrder = [...newList].reverse();
    localStorage.setItem("notices", JSON.stringify(originalOrder));

    setNotices(newList);
    setCheckedItems({});
    setCheckAll(false);
    setShowDeleteModal(false);
  };

  return (
    <>
      {/* ===== 상단 옵션/버튼 줄 ===== */}
      <section className={styles.noticeWrapper}>
        <div className={styles.topRow}>
          {/* 좌측: 전체 선택 */}
          <div className={styles.selectAllBox}>
            <input
              type="checkbox"
              checked={checkAll}
              onChange={handleCheckAll}
            />
            <span>전체 선택</span>
          </div>

          {/* 우측: 작성 / 삭제 버튼 */}
          <div className={styles.topRowButtons}>
            <button
              className={styles.writeBtn}
              onClick={() => router.push("/admin/notice/write")} 
              // TODO: 실제 경로에 맞게 수정 (예: "/admin/notice/write")
            >
              <span>공지 작성하기</span>
              <Image src="/pencil2.svg" width={18} height={18} alt="작성" />
            </button>

            <button className={styles.deleteBtn} onClick={openDeleteModal}>
              <span>삭제하기</span>
              <Image src="/trash-01.svg" width={18} height={18} alt="삭제" />
            </button>
          </div>
        </div>

        <div className={styles.divider} />
      </section>

      {/* ===== 공지 리스트 영역 ===== */}
      <section className={styles.noticeListArea}>
        {notices.length === 0 ? (
          <div className={styles.emptyNotice}>등록된 공지가 없습니다.</div>
        ) : (
          notices.map((notice, idx) => (
            <div
              key={notice.id ?? idx}
              className={styles.cardCenterBox}
              onClick={() => toggle(idx)}
            >
              <article
                className={`${styles.noticeCard} ${
                  expandedIndex === idx ? styles.expanded : ""
                }`}
              >
                {/* 왼쪽 체크박스 */}
                <input
                  type="checkbox"
                  className={styles.cardCheck}
                  checked={checkedItems[idx] || false}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setCheckedItems((prev) => {
                      const newState = {
                        ...prev,
                        [idx]: checked,
                      };
                      const checkedCount = Object.values(newState).filter(
                        (v) => v === true
                      ).length;
                      setCheckAll(checkedCount === notices.length);
                      return newState;
                    });
                  }}
                />

                <div className={styles.cardContent}>
                  <h2>{notice.title}</h2>
                  <p className={styles.date}>작성일: {notice.date}</p>

                  {expandedIndex === idx ? (
                    <div className={styles.descFull}>
                      {Array.isArray(notice.content)
                        ? notice.content.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))
                        : <p>{notice.content}</p>}
                    </div>
                  ) : (
                    <p className={styles.desc}>{notice.preview}</p>
                  )}
                </div>
              </article>
            </div>
          ))
        )}
      </section>

      {/* ===== 삭제 확인 모달 ===== */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title={targetTitle}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
