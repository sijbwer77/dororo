'use client';

import Image from 'next/image';
import styles from './infosection.module.css';

export default function InfoSection({ isEditing, setIsEditing, userData, handleInputChange }) {
  if (!userData) return null;

  return (
    <>
      <header className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <Image
            src={userData.profileImage || '/profile-circle.svg'}
            alt="프로필 아이콘"
            fill
            sizes="246px"
            className={styles.profilePreview}
          />
        </div>
        {isEditing && (
          <label className={styles.uploadLabel}>
            프로필 이미지 변경
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const objectUrl = URL.createObjectURL(file);
                handleInputChange({ target: { name: 'profileImage', value: objectUrl } });
              }}
            />
          </label>
        )}
        <h1 className={styles.profileName}>{userData.name}</h1>
      </header>

      <section className={styles.infoSection}>
        <div className={styles.infoTitleBar}>
          <h2 className={styles.infoTitle}>개인 정보</h2>

          <div className={styles.pencilIcon} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? (
              <Image src="/save.svg" alt="저장" width={24} height={24} />
            ) : (
              <Image src="/pencil.svg" alt="편집" width={24} height={24} />
            )}
          </div>
        </div>
        <div className={styles.titleLine}></div>

        <div className={styles.infoGrid}>
          <span className={styles.infoLabel}>이름</span>
          {isEditing ? (
            <input
              name="name"
              className={styles.infoInput}
              value={userData.name}
              onChange={handleInputChange}
            />
          ) : (
            <span className={styles.infoValue}>{userData.name}</span>
          )}
          <div className={styles.infoLine}></div>

          <span className={styles.infoLabel}>소속</span>
          {isEditing ? (
            <input
              name="organization"
              className={styles.infoInput}
              value={userData.organization}
              onChange={handleInputChange}
            />
          ) : (
            <span className={styles.infoValue}>{userData.organization}</span>
          )}
          <div className={styles.infoLine}></div>

          <span className={styles.infoLabel}>ID</span>
          <span className={styles.infoValue}>{userData.username}</span>
          <div className={styles.infoLine}></div>

          <span className={styles.infoLabel}>e-mail</span>
          {isEditing ? (
            <input
              name="email"
              type="email"
              className={styles.infoInput}
              value={userData.email}
              onChange={handleInputChange}
            />
          ) : (
            <span className={styles.infoValue}>{userData.email}</span>
          )}
          <div className={styles.infoLine}></div>

          <span className={styles.infoLabel}>solved.ac ID</span>
          {isEditing ? (
            <input
              name="solvedAc"
              className={styles.infoInput}
              value={userData.solvedAc}
              onChange={handleInputChange}
              placeholder="예: johndoe123"
            />
          ) : (
            <span className={styles.infoValue}>{userData.solvedAc || ''}</span>
          )}
        </div>
        <div className={styles.bottomLine}></div>
      </section>
    </>
  );
}