// app/admin/notice/page.js
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./notice.manage.module.css";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { fetchNotices, bulkDeleteNotices } from "@/lib/notice";

export default function NoticeManagePage() {
  const router = useRouter();

  // 공지 목록 상태
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 처음 로딩 시 공지 목록 가져오기
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotices();
        setNotices(data);       // 백엔드에서 date / preview 다 내려줌
      } catch (err) {
        console.error(err);
        alert("공지 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // 체크박스 상태
  const [checkedItems, setCheckedItems] = useState({});
  const [checkAll, setCheckAll] = useState(false);

  const handleCheckAll = () => {
    setCheckedItems(() => {
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

  // 실제 삭제 (백엔드 + 프론트 상태 동기화)
  const handleDelete = async () => {
    try {
      // 선택된 index → 실제 공지 ID 배열로 변환
      const idsToDelete = targetIndexes
        .map((idx) => notices[idx]?.id)
        .filter((v) => v != null);

      if (idsToDelete.length === 0) {
        alert("삭제할 공지가 없습니다.");
        return;
      }

      // 백엔드에 삭제 요청
      await bulkDeleteNotices(idsToDelete);

      // 프론트 상태에서도 제거
      const newList = notices.filter((_, idx) => !targetIndexes.includes(idx));
      setNotices(newList);
      setCheckedItems({});
      setCheckAll(false);
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert("공지 삭제 중 오류가 발생했습니다.");
    }
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
              onClick={() => router.push("/manage/notice/write")}
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
        {loading ? (
          <div className={styles.emptyNotice}>공지 목록을 불러오는 중입니다...</div>
        ) : notices.length === 0 ? (
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
