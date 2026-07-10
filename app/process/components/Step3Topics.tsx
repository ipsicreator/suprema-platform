type ProcessProfile = Record<string, unknown>;
type ProcessAnalysisResult = Record<string, unknown>;
type ProcessTopicsResult = {
  topics?: unknown[];
  [key: string]: unknown;
};

type Step3TopicsProps = {
  onNext?: () => void;
  onPrev?: () => void;
  profile?: ProcessProfile;
  analysisResult?: ProcessAnalysisResult;
  topicsResult?: ProcessTopicsResult;
  setTopicsResult?: (value: ProcessTopicsResult) => void;
};

export function Step3Topics({ onNext, onPrev }: Step3TopicsProps) {
  return (
    <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>3단계 · 탐구·독서 제안</h2>
      <p style={{ color: "#6b7280" }}>
        학생부 추출 3개와 직접 입력한 3개를 바탕으로 탐구, 독서, 세특 제안을 생성하는 화면입니다.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button onClick={onPrev} style={secondaryButton}>
          이전
        </button>
        <button onClick={onNext} style={primaryButton}>
          다음
        </button>
      </div>
    </section>
  );
}

const primaryButton = {
  border: "none",
  background: "#8b1a1a",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
};

const secondaryButton = {
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
};
