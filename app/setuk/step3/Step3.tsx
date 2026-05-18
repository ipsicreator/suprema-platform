"use client";

import styles from "../page.module.css";

export default function Step3() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div className={styles.loadingPulse}>
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>🧠</div>
        <h2 className={styles.sectionTitle}>AI가 활동을 정밀 분석 중입니다</h2>
        <p style={{ color: "var(--text-dim)", fontWeight: 700 }}>학생의 역량이 가장 잘 드러나는 문장을 구성하고 있습니다...</p>
      </div>
    </div>
  );
}
