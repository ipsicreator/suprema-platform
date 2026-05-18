"use client";

import styles from "../page.module.css";

interface Step2Props {
  subject: string;
  setSubject: (val: string) => void;
  topic: string;
  setTopic: (val: string) => void;
  activity: string;
  setActivity: (val: string) => void;
  isMajorRelated: boolean;
  setIsMajorRelated: (val: boolean) => void;
  onPrev: () => void;
  onAnalyze: () => void;
}

export default function Step2({
  subject,
  setSubject,
  topic,
  setTopic,
  activity,
  setActivity,
  isMajorRelated,
  setIsMajorRelated,
  onPrev,
  onAnalyze,
}: Step2Props) {
  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>탐구 활동 정보 입력</h2>
      <div className={styles.formGrid}>
        
        {/* Subject Select */}
        <div className={styles.formGroup}>
          <label className={styles.label}>관련 과목</label>
          <select className={styles.select} value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">과목 선택</option>
            <option value="국어">국어</option>
            <option value="수학">수학</option>
            <option value="영어">영어</option>
            <option value="과학">과학</option>
            <option value="사회">사회</option>
            <option value="정보">정보(IT)</option>
          </select>
        </div>

        {/* Topic Input */}
        <div className={styles.formGroup}>
          <label className={styles.label}>탐구 주제</label>
          <input 
            className={styles.input} 
            placeholder="예: 인공지능의 윤리적 딜레마" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
          />
        </div>

        {/* Activity Textarea */}
        <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
          <label className={styles.label}>활동 내용</label>
          <textarea 
            className={styles.input} 
            style={{ minHeight: "100px", resize: "none" }}
            placeholder="어떤 탐구를 진행했는지 핵심 내용을 입력해 주세요."
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </div>

        {/* Major Related Checkbox */}
        <div className={styles.checkboxGroup} style={{ gridColumn: "span 2" }}>
          <input 
            type="checkbox" 
            className={styles.checkbox} 
            id="major-check" 
            checked={isMajorRelated} 
            onChange={(e) => setIsMajorRelated(e.target.checked)} 
          />
          <label htmlFor="major-check" style={{ fontWeight: 700, fontSize: "13px", cursor: "pointer", color: "var(--text-main)" }}>
            전공 적합성 강조 (희망 전공과 연계하여 분석합니다)
          </label>
        </div>
      </div>

      {/* Button Row */}
      <div className={styles.btnRow}>
        <button className={styles.btnSecondary} onClick={onPrev}>이전으로</button>
        <button 
          className="btn-premium" 
          onClick={onAnalyze}
          disabled={!subject || !topic || !activity}
        >
          AI 분석 시작하기
        </button>
      </div>
    </div>
  );
}
