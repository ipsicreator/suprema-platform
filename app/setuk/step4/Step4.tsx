"use client";

import styles from "../page.module.css";

interface Step4Props {
  subject: string;
  topic: string;
  isMajorRelated: boolean;
  result: string;
  onReset: () => void;
}

export default function Step4({
  subject,
  topic,
  isMajorRelated,
  result,
  onReset,
}: Step4Props) {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    alert("문장이 복사되었습니다.");
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.resultCard}>
        <h2 className={styles.resultTitle}>분석 결과 리포트</h2>
        
        {/* Meta Info */}
        <div className={styles.resultMeta}>
          <div className={styles.metaItem}>
            <strong>분석 대상</strong>
            <span>{subject} · {topic}</span>
          </div>
          <div className={styles.metaItem}>
            <strong>강조 역량</strong>
            <span>{isMajorRelated ? "전공적합성, 학업역량" : "자기주도성, 탐구역량"}</span>
          </div>
        </div>
        
        {/* Generated Sentence Box */}
        <div className={styles.sentenceBox}>
          <div className={styles.expertBadge}>AI EXPERT INSIGHT</div>
          {result}
        </div>

        {/* Buttons */}
        <div className={styles.btnRow} style={{ marginTop: "32px" }}>
          <button className={styles.btnSecondary} onClick={onReset}>다시 입력하기</button>
          <button className="btn-premium" onClick={handleCopy}>
            결과 복사하기
          </button>
        </div>
      </div>
    </div>
  );
}
