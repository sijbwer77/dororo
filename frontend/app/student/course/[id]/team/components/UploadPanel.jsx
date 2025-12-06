'use client';

import styles from "../team.module.css";
import Image from "next/image";
import { useRef } from "react";

export default function UploadPannel({ files, addFile }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const objectUrl = URL.createObjectURL(selected);
      addFile({
        id: Date.now(),
        name: selected.name,
        url: objectUrl,
      });
    }
    e.target.value = "";
  };

  return (
    <div className={styles.uploadContainer}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div
        className={styles.fileUploadBox}
        onClick={handleUploadClick}
        style={{ cursor: "pointer" }}
      >
        <Image src="/upload.svg" alt="Upload" width={60} height={60} />
        <p className={styles.uploadText}>파일을 업로드하세요</p>
      </div>

      <div className={styles.fileList}>
        {files.map((file) => (
          <a
            key={file.id}
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fileItem}
            style={{
              display: "block",
              textDecoration: "none",
              color: "black",
            }}
          >
            {file.name}
          </a>
        ))}
      </div>

      <div className={styles.pagination}>&lt; 1 2 3 &gt;</div>
    </div>
  );
}
