type ReportPDFViewProps = {
  profile?: {
    name?: string;
    school?: string;
    grade?: string;
    major?: string;
  };
  analysisResult?: {
    analysis?: {
      gpa?: number;
      subjects?: Array<{ subject: string; grade: number; unit: number }>;
    };
  };
  diagnosisResult?: Array<{
    university?: string;
    major?: string;
    level?: string;
  }>;
};

export default function ReportPDFView({ profile, analysisResult, diagnosisResult }: ReportPDFViewProps) {
  const subjects = analysisResult?.analysis?.subjects ?? [];
  const diagnosis = diagnosisResult ?? [];

  return (
    <section style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>종합 결과 보고서</h2>
      <p style={{ color: "#6b7280" }}>학생부 분석 → 탐구/독서 → 입시위치진단 흐름을 PDF 출력용으로 요약한 화면입니다.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 20 }}>
        <Card label="학생명" value={profile?.name || "-"} />
        <Card label="학교" value={profile?.school || "-"} />
        <Card label="학년" value={profile?.grade || "-"} />
        <Card label="희망학과" value={profile?.major || "-"} />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>교과 요약</h3>
        {subjects.length === 0 ? (
          <p style={{ color: "#6b7280" }}>과목 데이터 없음</p>
        ) : (
          <ul>
            {subjects.slice(0, 8).map((subject, index) => (
              <li key={`${subject.subject}-${index}`}>
                {subject.subject} / {subject.unit}단위 / {subject.grade}등급
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>지원 대학 판단</h3>
        {diagnosis.length === 0 ? (
          <p style={{ color: "#6b7280" }}>진단 결과 없음</p>
        ) : (
          <ul>
            {diagnosis.map((item, index) => (
              <li key={`${item.university}-${index}`}>
                {item.university || `대학 ${index + 1}`} / {item.major || "미정"} / {item.level || "보합"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fafaf9" }}>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
