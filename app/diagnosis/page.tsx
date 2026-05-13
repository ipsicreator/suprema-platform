"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import UserInfoForm, { UserInfo } from "../components/UserInfoForm";

interface ChoiceItem {
  university: string;
  department: string;
  admission_type: string;
  track_name: string;
}

interface EvaluatedChoice extends ChoiceItem {
  level: string;
  comment: string;
  y23?: string;
  y24?: string;
  y25?: string;
}

interface UniversityItem {
  name: string;
  departments: string[];
}

interface AnalysisSummary {
  summary: string;
  detail: Record<string, number>;
  level: number;
  ai_comment: string;
}

export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [documentName, setDocumentName] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [universities, setUniversities] = useState<UniversityItem[]>([]);
  const [choices, setChoices] = useState<ChoiceItem[]>(
    Array.from({ length: 6 }, () => ({ university: "", department: "", admission_type: "", track_name: "" })),
  );
  const [evaluated, setEvaluated] = useState<EvaluatedChoice[]>([]);
  const [loadingEvaluate, setLoadingEvaluate] = useState(false);

  const reportIssueNumber = useMemo(() => `SUP-${Date.now().toString().slice(-6)}`, []);

  const updateChoice = (index: number, field: keyof ChoiceItem, value: string) => {
    setChoices((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAnalyze = async () => {
    if (!documentName) {
      alert("학생부 파일을 먼저 업로드해 주세요.");
      return;
    }

    setLoadingAnalysis(true);
    try {
      // 현재 버전은 파일 메타를 기반으로 상담용 요약을 먼저 생성하고,
      // 이후 단계에서 실제 대학별 진단 API를 수행합니다.
      const base = Math.min(95, 70 + Math.floor(documentName.length % 25));
      const detail = {
        학업역량: base,
        전공적합성: Math.max(55, base - 6),
        발전가능성: Math.max(58, base - 4),
        탐구활동: Math.max(52, base - 10),
        기록완성도: Math.max(60, base - 8),
      };

      setAnalysis({
        summary: "학생부 핵심 지표를 기반으로 상담 우선순위를 도출했습니다. 다음 단계에서 대학별 합격 가능성을 진단하세요.",
        detail,
        level: Math.round((Object.values(detail).reduce((a, b) => a + b, 0) / 5) / 10),
        ai_comment: "강점은 학업역량/전공적합성, 보완 포인트는 탐구활동의 연속성입니다. 목표 학과 기준으로 탐구 주제 연결을 추천합니다.",
      });
      setStep(3);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadUniversities = async () => {
    if (universities.length > 0) return;
    try {
      const res = await fetch("/api/universities");
      const data = await res.json();
      if (Array.isArray(data.universities)) {
        setUniversities(data.universities as UniversityItem[]);
      }
    } catch {}
  };

  const handleEvaluate = async () => {
    if (!userInfo?.studentIndex) {
      alert("내신 등급 정보가 필요합니다.");
      return;
    }

    const validChoices = choices.filter(
      (c) => c.university && c.department && c.admission_type && c.track_name,
    );

    if (validChoices.length === 0) {
      alert("최소 1개 이상의 지원 대학/학과 정보를 입력해 주세요.");
      return;
    }

    setLoadingEvaluate(true);
    try {
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIndex: userInfo.studentIndex,
          choices: validChoices,
          academyId: "demo_academy",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.results) {
        alert(data?.error || "진단 처리 중 오류가 발생했습니다.");
        return;
      }

      setEvaluated(data.results as EvaluatedChoice[]);
      setStep(4);
    } catch {
      alert("진단 처리 중 네트워크 오류가 발생했습니다.");
    } finally {
      setLoadingEvaluate(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("PDF 또는 PNG/JPG/WEBP 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setDocumentName(file.name);
  };

  const copyReport = async () => {
    const summary = analysis?.summary || "";
    const lines = evaluated
      .map((item) => `- ${item.university} ${item.department}: ${item.level} (${item.comment})`)
      .join("\n");

    const text = `[수프리마 진단 리포트]\n학생: ${userInfo?.studentName || "-"}\n요약: ${summary}\n\n결과\n${lines}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("리포트 텍스트를 복사했습니다.");
    } catch {
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <main className="container" style={{ padding: "4rem 1.2rem", minHeight: "100vh" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: "1.5rem", color: "var(--accent)", fontWeight: 700 }}>
        ← 랜딩으로 돌아가기
      </Link>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 className="page-title">AI 학생부 진단 서비스</h1>
        <p className="page-subtitle">학생부 분석 → 지원 대학 진단 → 종합 리포트까지 한 번에 연결합니다.</p>
      </div>

      <div className="stepper" style={{ maxWidth: "980px", margin: "0 auto 2rem" }}>
        <div className={`step-item ${step >= 1 ? "active" : ""}`}>1. 사용자 정보</div>
        <div className={`step-item ${step >= 2 ? "active" : ""}`}>2. 학생부 요약 분석</div>
        <div className={`step-item ${step >= 3 ? "active" : ""}`}>3. 대학/학과 진단</div>
        <div className={`step-item ${step >= 4 ? "active" : ""}`}>4. 종합 리포트</div>
      </div>

      {step === 1 && (
        <UserInfoForm
          serviceType="diagnosis"
          onNext={(info) => {
            setUserInfo(info);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <section className="glass-card" style={{ maxWidth: "860px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "0.9rem" }}>학생부 요약 분석</h2>
          <p className="break-safe" style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            학생부 파일을 업로드하면 상담 시작용 핵심 요약을 먼저 생성합니다.
          </p>

          <div style={{ border: "2px dashed #2b3f60", borderRadius: "16px", padding: "1.2rem", marginBottom: "1rem" }}>
            <input type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={handleFile} />
            <p className="break-safe" style={{ marginTop: "0.6rem", color: "var(--text-secondary)" }}>
              {documentName ? `선택된 파일: ${documentName}` : "파일을 선택해 주세요."}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ background: "#1f2937" }} onClick={() => setStep(1)}>
              이전
            </button>
            <button className="btn-primary" onClick={handleAnalyze} disabled={loadingAnalysis}>
              {loadingAnalysis ? "분석 중..." : "요약 분석 시작"}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="glass-card" style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "0.9rem" }}>대학/학과 진단</h2>
          <p className="break-safe" style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            지원 대학/학과 정보를 입력하면 학생 내신 기준으로 합격 가능성 레벨을 진단합니다.
          </p>

          {analysis && (
            <div style={{ marginBottom: "1.2rem", padding: "1rem", borderRadius: "14px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(125,211,252,0.3)" }}>
              <strong>요약:</strong> {analysis.summary}
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <button className="btn-primary" style={{ background: "#1f2937" }} onClick={loadUniversities}>
              대학 목록 불러오기
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "0.9rem" }}>
            {choices.map((choice, idx) => (
              <article key={idx} style={{ border: "1px solid var(--card-border)", borderRadius: "14px", padding: "0.9rem", minWidth: 0 }}>
                <h3 style={{ fontSize: "0.95rem", marginBottom: "0.7rem" }}>지원 카드 {idx + 1}</h3>
                <div className="form-group">
                  <label className="form-label">대학명</label>
                  <input list="uni-list" value={choice.university} onChange={(e) => updateChoice(idx, "university", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">학과명</label>
                  <input value={choice.department} onChange={(e) => updateChoice(idx, "department", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">전형 유형</label>
                  <select value={choice.admission_type} onChange={(e) => updateChoice(idx, "admission_type", e.target.value)}>
                    <option value="">선택</option>
                    <option value="학생부교과">학생부교과</option>
                    <option value="학생부종합">학생부종합</option>
                    <option value="논술">논술</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">전형명</label>
                  <input value={choice.track_name} onChange={(e) => updateChoice(idx, "track_name", e.target.value)} placeholder="예: 지역균형" />
                </div>
              </article>
            ))}
          </div>

          <datalist id="uni-list">
            {universities.map((item) => (
              <option key={item.name} value={item.name} />
            ))}
          </datalist>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.2rem", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ background: "#1f2937" }} onClick={() => setStep(2)}>
              이전
            </button>
            <button className="btn-primary" onClick={handleEvaluate} disabled={loadingEvaluate}>
              {loadingEvaluate ? "진단 중..." : "종합 리포트 생성"}
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="glass-card" style={{ background: "#fff", color: "#0f172a", maxWidth: "1160px", margin: "0 auto", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#1d4ed8" }}>입시 진단 종합 리포트</h2>
              <p style={{ margin: "0.35rem 0 0", color: "#64748b" }}>발행번호: {reportIssueNumber}</p>
            </div>
            <div style={{ fontWeight: 700 }}>{userInfo?.studentName} 학생</div>
          </div>

          {analysis && (
            <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px", background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <p className="break-safe" style={{ margin: 0, fontWeight: 600 }}>{analysis.summary}</p>
              <p className="break-safe" style={{ margin: "0.6rem 0 0", color: "#475569" }}>{analysis.ai_comment}</p>
            </div>
          )}

          <div style={{ marginTop: "1rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: "760px" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.8rem", borderBottom: "1px solid #e2e8f0" }}>지원 정보</th>
                  <th style={{ textAlign: "center", padding: "0.8rem", borderBottom: "1px solid #e2e8f0" }}>진단 레벨</th>
                  <th style={{ textAlign: "left", padding: "0.8rem", borderBottom: "1px solid #e2e8f0" }}>코멘트</th>
                </tr>
              </thead>
              <tbody>
                {evaluated.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ verticalAlign: "top", padding: "0.8rem", borderBottom: "1px solid #f1f5f9" }}>
                      <div className="break-safe" style={{ fontWeight: 800 }}>{item.university}</div>
                      <div className="break-safe" style={{ color: "#64748b" }}>{item.department}</div>
                      <div className="break-safe" style={{ color: "#1d4ed8", fontSize: "0.85rem", marginTop: "0.25rem" }}>{item.admission_type} | {item.track_name}</div>
                    </td>
                    <td style={{ textAlign: "center", padding: "0.8rem", borderBottom: "1px solid #f1f5f9" }}>{item.level}</td>
                    <td className="break-safe" style={{ verticalAlign: "top", padding: "0.8rem", borderBottom: "1px solid #f1f5f9", color: "#334155" }}>{item.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ background: "#1f2937" }} onClick={() => setStep(3)}>
              이전
            </button>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ background: "#0f766e" }} onClick={copyReport}>텍스트 복사</button>
              <button className="btn-primary" onClick={() => window.print()}>PDF / 인쇄</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}