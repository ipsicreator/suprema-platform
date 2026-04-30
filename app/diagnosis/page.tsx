"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserInfoForm, { UserInfo } from "../components/UserInfoForm";

export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Step 2
  const [pdfBase64, setPdfBase64] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [holisticResult, setHolisticResult] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Step 3
  const [universities, setUniversities] = useState<string[]>([]);
  const [choices, setChoices] = useState<any[]>(Array(6).fill({ university: "", department: "", admission_type: "", track_name: "" }));
  const [evaluated, setEvaluated] = useState<any[]>([]);
  const [loadingEval, setLoadingEval] = useState(false);

  const handleNextInfo = (info: UserInfo) => {
    setUserInfo(info);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        // extract base64 part
        const base64 = result.split(",")[1];
        setPdfBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch("/api/diagnosis.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_pdf",
          pdf_base64: pdfBase64,
          ai_enabled: aiEnabled
        })
      });
      const data = await res.json();
      if (data.success) {
        setHolisticResult(data.result);
      } else {
        alert("분석 오류: " + data.error);
      }
    } catch (e) {
      alert("분석 요청 중 오류가 발생했습니다.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const res = await fetch("/api/diagnosis.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_susi_options" })
      });
      const data = await res.json();
      if (data.success) {
        setUniversities(data.universities);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (step === 3 && universities.length === 0) {
      fetchUniversities();
    }
  }, [step, universities]);

  const updateChoice = (index: number, field: string, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setChoices(newChoices);
  };

  const handleEvaluate = async () => {
    const validChoices = choices.filter(c => c.university && c.department && c.admission_type && c.track_name);
    if (validChoices.length === 0) {
      alert("최소 1개의 지원 희망 대학 정보를 모두 입력해주세요.");
      return;
    }
    
    setLoadingEval(true);
    try {
      const res = await fetch("/api/diagnosis.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_choices",
          choices: validChoices,
          student_index: userInfo?.studentIndex || 50
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluated(data.evaluated);
        
        // Save session
        await fetch("/api/diagnosis.py", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save_session",
            profile: userInfo,
            choices: data.evaluated
          })
        });
        
        setStep(4);
      } else {
        alert("오류: " + data.error);
      }
    } catch (e) {
      alert("평가 요청 중 오류가 발생했습니다.");
    } finally {
      setLoadingEval(false);
    }
  };

  return (
    <main className="container" style={{ padding: "4rem 2rem" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: "2rem", color: "var(--accent)" }}>
        &larr; 홈으로 돌아가기
      </Link>
      
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="page-title">나의 입시 위치 진단 서비스</h1>
        <p className="page-subtitle">학생부 분석 및 대학별 컷 비교를 통한 맞춤형 지원 전략 수립</p>
      </div>

      <div className="stepper">
        <div className={`step-item ${step >= 1 ? "active" : ""}`}>1. 개인정보</div>
        <div className={`step-item ${step >= 2 ? "active" : ""}`}>2. 학생부 분석</div>
        <div className={`step-item ${step >= 3 ? "active" : ""}`}>3. 지원희망대학</div>
        <div className={`step-item ${step >= 4 ? "active" : ""}`}>4. 종합보고서</div>
      </div>

      {step === 1 && <UserInfoForm onNext={handleNextInfo} serviceType="diagnosis" />}

      {step === 2 && (
        <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
            학생부 분석
          </h2>
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">학생부 PDF 업로드</label>
            <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ padding: "1rem" }} />
          </div>
          <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <input 
              type="checkbox" 
              checked={aiEnabled} 
              onChange={e => setAiEnabled(e.target.checked)} 
              style={{ width: "auto" }}
            />
            <label className="form-label" style={{ margin: 0 }}>AI 보조 분석 코멘트 사용 (OpenAI 필요)</label>
          </div>
          
          <button className="btn-primary" onClick={handleAnalyze} disabled={loadingAnalysis} style={{ width: "100%", marginBottom: "2rem" }}>
            {loadingAnalysis ? <div className="spinner"></div> : "학생부 분석 실행"}
          </button>

          {holisticResult && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              <h3 style={{ color: "#4ade80", marginBottom: "1rem" }}>분석 완료</h3>
              <p style={{ fontWeight: 600, marginBottom: "1rem" }}>{holisticResult.summary}</p>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                {Object.entries(holisticResult.detail || {}).map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(0,0,0,0.3)", padding: "0.5rem", borderRadius: "6px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{k}:</span> <strong>{String(v)}점</strong>
                  </div>
                ))}
              </div>
              
              {holisticResult.ai_comment && (
                <div style={{ marginTop: "1rem", padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <h4 style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>AI 코멘트</h4>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>{holisticResult.ai_comment}</p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.1)", color: "white" }} onClick={() => setStep(1)}>
              &larr; 이전
            </button>
            <button className="btn-primary" onClick={() => setStep(3)} disabled={!holisticResult}>
              다음 단계 &rarr;
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card">
          <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
            지원 희망 대학 평가 (최대 6개)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {choices.map((choice, idx) => (
              <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--accent)" }}>지원 {idx + 1}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">학교명</label>
                    <input 
                      type="text" 
                      value={choice.university} 
                      onChange={e => updateChoice(idx, "university", e.target.value)} 
                      placeholder="예: 서울대" 
                      list="uni-options"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">학과명</label>
                    <input 
                      type="text" 
                      value={choice.department} 
                      onChange={e => updateChoice(idx, "department", e.target.value)} 
                      placeholder="예: 경영학과" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">전형 유형</label>
                    <select value={choice.admission_type} onChange={e => updateChoice(idx, "admission_type", e.target.value)}>
                      <option value="">선택하세요</option>
                      <option value="학생부교과">학생부교과</option>
                      <option value="학생부종합">학생부종합</option>
                      <option value="논술">논술</option>
                      <option value="실기/실적">실기/실적</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">전형명</label>
                    <input 
                      type="text" 
                      value={choice.track_name} 
                      onChange={e => updateChoice(idx, "track_name", e.target.value)} 
                      placeholder="예: 일반전형" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <datalist id="uni-options">
            {universities.map(u => <option key={u} value={u} />)}
          </datalist>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.1)", color: "white" }} onClick={() => setStep(2)}>
              &larr; 이전
            </button>
            <button className="btn-primary" onClick={handleEvaluate} disabled={loadingEval}>
              {loadingEval ? <div className="spinner"></div> : "평가 실행 및 결과 보기 &rarr;"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="glass-card">
          <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem", color: "#4ade80" }}>
            진단 종합 결과 보고서
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent)", marginBottom: "1rem" }}>지원 대학 평가 결과</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {evaluated.map((res, i) => (
                  <div key={i} style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "12px", borderLeft: `4px solid ${res.diag_level.includes("상향") || res.diag_level.includes("적정") ? "#4ade80" : "#f59e0b"}` }}>
                    <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>{res.university} {res.department}</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{res.admission_type} / {res.track_name}</p>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: res.diag_level.includes("하향") ? "#f87171" : "inherit" }}>
                      진단: {res.diag_level}
                    </div>
                    <p style={{ fontSize: "0.9rem" }}>{res.diag_reason}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: "1.2rem", color: "var(--accent)", marginBottom: "1rem" }}>학생 지표 및 학생부 분석 요약</h3>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "12px" }}>
                <p style={{ marginBottom: "0.5rem" }}><strong>학생 지표:</strong> {userInfo?.studentIndex}점</p>
                <p style={{ marginBottom: "0.5rem" }}><strong>종합 단계:</strong> {holisticResult?.level}단계</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>{holisticResult?.summary}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem" }}>
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.1)", color: "white" }} onClick={() => setStep(3)}>
              &larr; 지원 대학 다시 수정
            </button>
            <button className="btn-primary" onClick={() => window.print()}>
              보고서 출력 / PDF 저장
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
