"use client";

import styles from "./notice.manage.module.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DeleteConfirmModal from "./DeleteConfirmModal";


export default function NoticeManagePage() {
  const router = useRouter();
  /* =========================
     1) 공지 데이터 (배열)
  ========================== */
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("notices") || "[]");
    setNotices(saved.reverse());
  }, []);

  const noticeCount = notices.length;

  /* =========================
     2) 확장 상태 관리
  ========================== */
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggle = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  /* =========================
     3) 체크박스 전체 선택 관리
  ========================== */
  const [checkedItems, setCheckedItems] = useState({});
  const [checkAll, setCheckAll] = useState(false);

  const handleCheckAll = () => {
    setCheckedItems(prev => {
      const newState = {};

      notices.forEach((_, idx) => {
        newState[idx] = !checkAll;
      });

      return newState;
    });

    setCheckAll(!checkAll);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const [targetIndexes, setTargetIndexes] = useState([]);

  const handleDelete = () => {
    const newList = notices.filter((_, idx) => !targetIndexes.includes(idx));

    const originalOrder = [...newList].reverse();
    localStorage.setItem("notices", JSON.stringify(originalOrder));
    
    setNotices(newList);
    setCheckedItems({});
    setCheckAll(false);
    setShowDeleteModal(false);
  };

  return (
    <div className={styles.container}>

      {/* ===== 상단 헤더 ===== */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <Image src="/doro-logo.svg" alt="DORO 로고" width={145} height={70} />
        </div>

        <div className={styles.profile}>
          <Image src="/profile-circle2.svg" alt="프로필" width={40} height={40} />
        </div>
      </div>

      <div className={styles.layout}>

        {/* ===== 사이드바 ===== */}
        <Sidebar active="notice" />

        {/* ===== 메인 ===== */}
        <main className={styles.main}>

          {/* ===== 고정 상단 메뉴 ===== */}
          <div className={styles.noticeWrapper}>

            {/* 상단 메뉴 줄 */}
            <div className={styles.topRow}>
              <div className={styles.selectAllBox}>
                <input
                  type="checkbox"
                  checked={checkAll}
                  onChange={handleCheckAll}
                />
                <span>전체 선택</span>
              </div>

              <div className={styles.topRowButtons}>
                <button 
                  className={styles.writeBtn}
                  onClick={() => router.push("/manage/write")}
                >
                  <span>공지 작성하기</span>
                  <Image src="/pencil2.svg" width={18} height={18} alt="작성" />
                </button>

                <button 
                  className={styles.deleteBtn}
                  onClick={() => {
                    const selected = Object.keys(checkedItems)
                      .filter(k => checkedItems[k])
                      .map(idx => Number(idx));

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
                  }}
                >

                  <span>삭제하기</span>
                  <Image src="/trash-01.svg" width={18} height={18} alt="삭제" />
                </button>
              </div>
            </div>

            {/* 구분선 — 반드시 topRow 바깥! */}
            <div className={styles.divider}></div>

          </div>
          


          {/* ===== 공지 리스트 ===== */}
          <div className={styles.noticeListArea}>

            {notices.length === 0 ? (
              <div className={styles.emptyNotice}>
                <span>공지 없음</span>
              </div>
            ) : (
              notices.map((notice, idx) => (
                <div
                  key={notice.id}
                  className={styles.cardCenterBox}
                  onClick={() => toggle(idx)}
                >
                  <div
                    className={`${styles.noticeCard} ${
                      expandedIndex === idx ? styles.expanded : ""
                    }`}
                  >
                    {/* 체크박스 */}
                    <input
                      type="checkbox"
                      className={styles.cardCheck}
                      checked={checkedItems[idx] || false}
                      onChange={(e) => {
                        e.stopPropagation();

                        setCheckedItems(prev => {
                          const newState = {
                            ...prev,
                            [idx]: !prev[idx],
                          };

                          const checkedCount = Object.values(newState).filter(v => v === true).length;
                          setCheckAll(checkedCount === notices.length);

                          return newState;
                        });
                      }}
                    />

                    {/* 내용 */}
                    <div className={styles.cardContent}>
                      <h2>{notice.title}</h2>
                      <p className={styles.date}>작성일: {notice.date}</p>

                      {expandedIndex === idx ? (
                        <div className={styles.descFull}>
                          {notice.content.map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.desc}>{notice.preview}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </main>
        {/* 모델링 */}
        {showDeleteModal && (
          <DeleteConfirmModal
            title={targetTitle}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
