type ProcessSubject = {
  subject: string;
  unit?: string | number;
  grade?: string | number;
};

type ProcessAnalysisResult = {
  analysis?: {
    subjects?: ProcessSubject[];
  };
};

type Step2DashboardProps = {
  onNext?: () => void;
  onPrev?: () => void;
  analysisResult?: ProcessAnalysisResult;
};

export function Step2Dashboard({ onNext, onPrev, analysisResult }: Step2DashboardProps) {
  const subjects = analysisResult?.analysis?.subjects ?? [];

  return (
    <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>2단계 · 학생부 분석</h2>
      <p style={{ color: "#6b7280" }}>학생부 원본과 요약 분석이 이 단계에서 함께 정리됩니다.</p>
      <div style={{ marginTop: 16 }}>
        {subjects.length === 0 ? (
          <p style={{ color: "#6b7280" }}>과목 데이터 없음</p>
        ) : (
          <ul>
            {subjects.slice(0, 8).map((item, index) => (
              <li key={`${item.subject}-${index}`}>
                {item.subject} / {item.unit ?? "-"}단위 / {item.grade ?? "-"}등급
              </li>
            ))}
          </ul>
        )}
      </div>
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
