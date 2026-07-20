type ProcessProfile = Record<string, string | boolean>;
type ProcessAnalysisResult = Record<string, unknown>;

type Step1UploadProps = {
  onNext?: () => void;
  profile?: ProcessProfile;
  setProfile?: (value: ProcessProfile) => void;
  setAnalysisResult?: (value: ProcessAnalysisResult) => void;
};

export function Step1Upload({ onNext }: Step1UploadProps) {
  return (
    <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>1단계 · 사용자정보 입력</h2>
      <p style={{ color: "#6b7280" }}>
        학생명, 학교, 학년, 연락처, 이메일, 학부모 연락처를 입력하는 단계입니다.
      </p>
      <button
        onClick={onNext}
        style={{
          marginTop: 20,
          border: "none",
          background: "#8b1a1a",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 12,
          fontWeight: 700,
        }}
      >
        다음 단계
      </button>
    </section>
  );
}
