// components/ScoreCircles.js
"use client";

import styles from "./ScoreCircles.module.css";

export default function ScoreCircles({ value = 0, onChange }) {
  // 왼쪽 → 오른쪽: 1,2,3,4,5
  const scores = [1, 2, 3, 4, 5];

  const handleClick = (score) => {
    if (!onChange) return;
    onChange(score);
  };

  return (
    <div className={styles.scoreCircles}>
      {scores.map((score) => (
        <button
          key={score}
          type="button"
          className={`${styles.circle} ${
            value >= score ? styles.filled : ""
          }`}
          onClick={() => handleClick(score)}
        ></button>
      ))}
    </div>
  );
}
