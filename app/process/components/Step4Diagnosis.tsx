import ReportPDFView from "./ReportPDFView";

type ProcessProfile = Record<string, unknown>;
type ProcessAnalysisResult = Record<string, unknown>;
type DiagnosisItem = Record<string, unknown>;

type Step4DiagnosisProps = {
  onPrev?: () => void;
  profile?: ProcessProfile;
  analysisResult?: ProcessAnalysisResult;
  diagnosisResult?: DiagnosisItem[];
  setDiagnosisResult?: (value: DiagnosisItem[]) => void;
};

export function Step4Diagnosis({ onPrev, profile, analysisResult, diagnosisResult }: Step4DiagnosisProps) {
  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onPrev} style={secondaryButton}>
          이전
        </button>
      </div>
      <ReportPDFView profile={profile} analysisResult={analysisResult} diagnosisResult={diagnosisResult} />
    </section>
  );
}

const secondaryButton = {
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
};
