"use client";

import Image from "next/image";
import styles from "./infosection.module.css";
import { useEffect, useState } from "react";

export default function InfoSection({
  isEditing,
  setIsEditing,
  userData,
  handleInputChange,
  saveChanges,
  onProfileSelect,
  onProfileReset,
}) {
  if (!userData) return null;

  const fallback = "/profile-circle.svg";
  const [profileSrc, setProfileSrc] = useState(
    userData.profileImage || fallback
  );

  useEffect(() => {
    setProfileSrc(userData.profileImage || fallback);
  }, [userData.profileImage]);

  return (
    <>
      <header className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <Image
            src={profileSrc}
            alt="프로필 아이콘"
            fill
            className={styles.profilePreview}
            onError={() => setProfileSrc(fallback)}
          />
        </div>

        {isEditing && (
          <div className={styles.profileActions}>
            <label className={styles.uploadLabel}>
              프로필 이미지 변경
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  onProfileSelect?.(file);
                }}
              />
            </label>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => onProfileReset?.()}
            >
              기본 이미지로 설정
            </button>
          </div>
        )}

        <h1 className={styles.profileName}>
          {userData.nickname || userData.username}
        </h1>
      </header>

      <section className={styles.infoSection}>
        <div className={styles.infoTitleBar}>
          <h2 className={styles.infoTitle}>개인 정보</h2>

          <div
            className={styles.pencilIcon}
            onClick={isEditing ? saveChanges : () => setIsEditing(true)}
          >
            {isEditing ? (
              <Image src="/save.svg" alt="저장" width={24} height={24} />
            ) : (
              <Image src="/pencil.svg" alt="편집" width={24} height={24} />
            )}
          </div>
        </div>

        <div className={styles.titleLine}></div>

        <div className={styles.infoGrid}>
          {/* 이름(nickname) */}
          <span className={styles.infoLabel}>닉네임</span>
          {isEditing ? (
            <input
              name="nickname"
              className={styles.infoInput}
              value={userData.nickname}
              onChange={handleInputChange}
            />
          ) : (
            <span className={styles.infoValue}>{userData.nickname}</span>
          )}
          <div className={styles.infoLine}></div>
          
          {/* 전화번호 */}
          <span className={styles.infoLabel}>전화번호</span>
          {isEditing ? (
            <input
              name="phone_number"
              className={styles.infoInput}
              value={userData.phone_number}
              onChange={handleInputChange}
            />
          ) : (
            <span className={styles.infoValue}>{userData.phone_number}</span>
          )}
          <div className={styles.infoLine}></div>

          {/* 소속 */}
          <span className={styles.infoLabel}>소속</span>
          <span className={styles.infoValue}>{userData.role}</span>
          <div className={styles.infoLine}></div>

          {/* ID */}
          <span className={styles.infoLabel}>ID</span>
          <span className={styles.infoValue}>{userData.username}</span>
          <div className={styles.infoLine}></div>

          {/* 이메일 */}
          <span className={styles.infoLabel}>e-mail</span>
          <span className={styles.infoValue}>{userData.email}</span>
          <div className={styles.infoLine}></div>



          {/* solved.ac */}
          <span className={styles.infoLabel}>solved.ac ID</span>
          {isEditing ? (
            <input
              name="solvedAc"
              className={styles.infoInput}
              value={userData.solvedAc}
              onChange={handleInputChange}
            />
          ) : (
            <span className={styles.infoValue}>{userData.solvedAc || ""}</span>
          )}
        </div>

        <div className={styles.bottomLine}></div>
      </section>
    </>
  );
}
