"use client";

import { useState } from "react";
import Link from "next/link";
import UserInfoForm, { UserInfo } from "../components/UserInfoForm";

export default function SetukPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const [subject, setSubject] = useState("국어");
  const [interestsRaw, setInterestsRaw] = useState("");
  const [useOpenAI, setUseOpenAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleNext = (info: UserInfo) => {
    setUserInfo(info);
    setStep(2);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const interests = interestsRaw.split(",").map(i => i.trim()).filter(i => i);
      
      const payload = {
        consultant_name: userInfo?.consultantName,
        center_name: "대치 수프리마 입시&코칭 센터",
        brand: "수프리마 AI 탐구 세특 솔루션",
        use_openai: useOpenAI,
        recommendation_count: 5,
        strict_dedup: true,
        profile: {
          student_name: userInfo?.studentName,
          grade: userInfo?.grade,
          subject: subject,
          interests: interests,
          career_hint: userInfo?.careerHint || "융합 탐구",
        }
      };

      const res = await fetch("/api/generate.py", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setStep(3);
      } else {
        alert("오류 발생: " + data.error);
      }
    } catch (e) {
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ padding: "4rem 2rem" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: "2rem", color: "var(--accent)" }}>
        &larr; 홈으로 돌아가기
      </Link>
      
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 className="page-title">AI 탐구 세특 솔루션</h1>
        <p className="page-subtitle">학생 맞춤형 심화 탐구 주제 추천 및 세특 문장 자동 생성</p>
      </div>

      <div className="stepper">
        <div className={`step-item ${step >= 1 ? "active" : ""}`}>1. 학생 정보</div>
        <div className={`step-item ${step >= 2 ? "active" : ""}`}>2. 탐구 흐름 설정</div>
        <div className={`step-item ${step >= 3 ? "active" : ""}`}>3. 결과 확인</div>
      </div>

      {step === 1 && (
        <UserInfoForm onNext={handleNext} serviceType="setuk" />
      )}

      {step === 2 && (
        <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
            탐구 흐름 설정
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">과목 선택</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="국어">국어</option>
                <option value="수학">수학</option>
                <option value="영어">영어</option>
                <option value="사회탐구">사회탐구</option>
                <option value="과학탐구">과학탐구</option>
                <option value="정보(IT)">정보(IT)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">관심 키워드 (쉼표 구분)</label>
              <input 
                type="text" 
                value={interestsRaw} 
                onChange={e => setInterestsRaw(e.target.value)} 
                placeholder="예: 환경, 데이터, 미디어" 
              />
            </div>
            <div className="form-group" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "2rem" }}>
              <input 
                type="checkbox" 
                checked={useOpenAI} 
                onChange={e => setUseOpenAI(e.target.checked)} 
                style={{ width: "auto" }}
              />
              <label className="form-label" style={{ margin: 0 }}>OpenAI로 세특 문장 고도화</label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.1)", color: "white" }} onClick={() => setStep(1)}>
              &larr; 이전
            </button>
            <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
              {loading ? <div className="spinner"></div> : "추천 생성 시작 ✨"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card">
          <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
            생성 결과 ({userInfo?.studentName} 학생, {subject})
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {results.map((res, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--accent)", marginBottom: "0.5rem" }}>
                  {i+1}. {res.topic_title}
                </h3>
                <p style={{ marginBottom: "1rem" }}><strong>탐구 방향:</strong> {res.topic_direction}</p>
                <p style={{ marginBottom: "1rem" }}><strong>예상 결론:</strong> {res.expected_conclusion}</p>
                <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "1rem", borderRadius: "8px", borderLeft: "4px solid var(--accent)" }}>
                  <strong>세특 문장:</strong> {res.setuk_sentence}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
            <button className="btn-primary" style={{ background: "rgba(255,255,255,0.1)", color: "white" }} onClick={() => setStep(2)}>
              &larr; 다시 생성하기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
