"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import StepProgress from "../components/StepProgress";
import styles from "./diagnosis.module.css";
import { UserInfo } from "../components/UserInfoForm";
import Step1 from "./step1/Step1";
import Step2 from "./step2/Step2";
import Step3 from "./step3/Step3";
import Step4 from "./step4/Step4";

interface UniversityData {
  name: string;
  departments: string[];
}

interface ChoiceItem {
  university: string;
  department: string;
  admission_type: string;
  track_name: string;
}

export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Universities loaded from API
  const [uniData, setUniData] = useState<UniversityData[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(false);

  // Choices selected by user (initialized with 2 empty choices by default)
  const [choices, setChoices] = useState<ChoiceItem[]>([
    { university: "", department: "", admission_type: "", track_name: "" },
    { university: "", department: "", admission_type: "", track_name: "" }
  ]);

  // Evaluation Results
  const [evaluated, setEvaluated] = useState<any[]>([]);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);

  // Session report issue number
  const [reportIssueNumber] = useState(() => `SUP-${Date.now().toString().slice(-6)}`);

  // Loading messages for the AI processing step
  const loadingMessages = [
    "대치동 3개년 실제 수시 합격선 데이터베이스 조회 중...",
    "학생 내신 등급 백분위 보정 및 등급 컷 매칭 중...",
    "대학별 반영 비율 및 가중치 시뮬레이션 적용 중...",
    "안정/적정/도전 지원 가능 분위 도출 중...",
    "AI 대치 수프리마 종합 진단 의견서 작성 완료 중...",
  ];

  // Fetch university data on mount
  useEffect(() => {
    async function loadUniversities() {
      setLoadingUnis(true);
      try {
        const res = await fetch("/api/universities");
        if (res.ok) {
          const data = await res.json();
          if (data.universities) {
            setUniData(data.universities);
          }
        }
      } catch (err) {
        console.error("Failed to load university options:", err);
      } finally {
        setLoadingUnis(false);
      }
    }
    loadUniversities();
  }, []);

  // Cycle loading messages when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loadingEval) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 700);
    } else {
      setLoadingMessageIdx(0);
    }
    return () => clearInterval(interval);
  }, [loadingEval]);

  // Handle Step 1 Completion
  const handleNextInfo = (info: UserInfo) => {
    setUserInfo(info);
    setStep(2);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper to update specific choice card fields
  const updateChoice = (index: number, field: keyof ChoiceItem, value: string) => {
    const updated = [...choices];
    // If university is changed, clear department to avoid mismatch
    if (field === "university") {
      updated[index] = {
        ...updated[index],
        university: value,
        department: "",
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setChoices(updated);
  };

  // Helper to reset a specific card
  const resetChoice = (index: number) => {
    const updated = [...choices];
    updated[index] = {
      university: "",
      department: "",
      admission_type: "",
      track_name: "",
    };
    setChoices(updated);
  };

  // Helper to add a new empty card slot (Max 6)
  const addChoice = () => {
    if (choices.length < 6) {
      setChoices([...choices, { university: "", department: "", admission_type: "", track_name: "" }]);
    }
  };

  // Helper to remove a specific card slot (Min 2)
  const removeChoice = (indexToRemove: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, idx) => idx !== indexToRemove));
    }
  };

  // Process Diagnosis
  const handleEvaluate = async () => {
    // Filter out cards that are completely empty
    const validChoices = choices.filter(
      (c) => c.university && c.department && c.admission_type
    );

    if (validChoices.length === 0) {
      alert("최소 1개 이상의 지원 희망 대학 정보(대학명, 학과명, 전형유형)를 올바르게 입력해주세요.");
      return;
    }

    setLoadingEval(true);
    setStep(3); // Go to loading transition step

    try {
      // Trigger API evaluation
      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIndex: userInfo?.studentIndex || 2.5,
          choices: validChoices,
          academyId: userInfo?.schoolName || "대치 수프리마",
        }),
      });

      if (!res.ok) {
        throw new Error("진단 평가 실패");
      }

      const data = await res.json();
      if (data.results) {
        setEvaluated(data.results);
        
        // Artificial delay of 2.2 seconds to allow premium loading messages to cycle
        setTimeout(() => {
          setStep(4);
          window.scrollTo({ top: 0, behavior: "smooth" });
          setLoadingEval(false);
        }, 2200);
      } else {
        throw new Error(data.error || "결과 데이터가 부족합니다.");
      }
    } catch (err: any) {
      alert(`진단 오류: ${err.message || "평가 처리 도중 예기치 못한 문제가 발생했습니다."}`);
      setStep(2);
      setLoadingEval(false);
    }
  };

  // Copy text report to clipboard helper
  const copyToClipboard = async () => {
    if (!evaluated.length) return;
    const text = `[대치 수프리마 AI 입시 위치 진단 리포트]\n\n대상 학생: ${userInfo?.studentName} 학생\n내신 지표: ${userInfo?.studentIndex} 등급\n\n[지원 대학교 분석 결과]\n${evaluated
      .map(
        (res, idx) =>
          `${idx + 1}. ${res.university} (${res.department}) - 전형: ${res.admission_type} | 판정: ${res.level}\n   소견: ${res.comment}`
      )
      .join("\n\n")}\n\n* 본 결과는 대치 수프리마 3개년 입결 추이 분석 알고리즘이 도출한 진단입니다.`;
    
    try {
      await navigator.clipboard.writeText(text);
      alert("진단 결과를 텍스트 형식으로 클립보드에 복사했습니다. SNS나 문자 전송 시 붙여넣기 하실 수 있습니다.");
    } catch (err) {
      alert("클립보드 복사에 실패했습니다.");
    }
  };

  // Filter department autocomplete options based on current university choice
  const getDepartmentsForUni = (uniName: string): string[] => {
    const found = uniData.find((u) => u.name === uniName);
    return found ? found.departments : [];
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--suprima-cream)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "16px 0", boxSizing: "border-box", fontFamily: "Pretendard, -apple-system, sans-serif" }}>
      
      {/* Screen Frame Template Card - Centered, Symmetrical, and Highly Compact */}
      <div id="diagnosis-wrapper" style={{
        width: "100%",
        maxWidth: "1150px",
        backgroundColor: "white",
        borderRadius: "40px",
        border: "1px solid #ECE0D1",
        boxShadow: "0 30px 80px rgba(44, 26, 10, 0.05)",
        padding: "20px 36px",
        boxSizing: "border-box",
        position: "relative"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", backgroundColor: "var(--suprima-burgundy)" }} />
        
        {/* Frame Header with Brand Logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ECE0D1", paddingBottom: "12px", marginBottom: "16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image 
              src="/suprema-logo.png" 
              alt="대치 수프리마 Su-Prima 입시&코칭 센터" 
              width={160} 
              height={44} 
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#9CA3AF", letterSpacing: "0.15em" }}>PREMIUM DIAGNOSIS</span>
        </div>

        {/* Multi-step progress bar integrated directly in the Frame */}
        {step <= 4 && step !== 3 && (
          <div style={{ marginBottom: "20px" }}>
            <StepProgress
              steps={["학생 정보 입력", "지원 희망 대학 선택", "진단 리포트 확인"]}
              currentStep={step === 4 ? 3 : step}
            />
          </div>
        )}

        {/* Title & Description Section (Compact & Unified) */}
        {step < 3 && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h1 className="heading-premium" style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "8px", color: "#1a0f08", letterSpacing: "-0.05em" }}>
              AI 입시 위치 진단 솔루션
            </h1>
            <p style={{ color: "#5D4D3D", fontWeight: 700, fontSize: "0.95rem", maxWidth: "800px", margin: "0 auto", lineHeight: "1.5" }}>
              대치 수프리마만의 독자적인 3개년 실제 합격컷(2023-2025) 및 가중치 추이 알고리즘으로 목표 대학의 지원 정밀 타당성과 합격 확률을 완벽히 계산합니다.
            </p>
          </div>
        )}

        {/* Content Slot */}
        <div style={{ position: "relative" }}>
          {/* Step 1: User Info Intake */}
          {step === 1 && (
            <Step1 onNext={handleNextInfo} />
          )}

          {/* Step 2: Choose target universities (Up to 6 Cards) */}
          {step === 2 && (
            <Step2
              choices={choices}
              userInfo={userInfo}
              uniData={uniData}
              updateChoice={updateChoice}
              resetChoice={resetChoice}
              removeChoice={removeChoice}
              addChoice={addChoice}
              onPrev={() => setStep(1)}
              onEvaluate={handleEvaluate}
            />
          )}

          {/* Step 3: Transition High-Tech Loading Animation */}
          {step === 3 && (
            <Step3 message={loadingMessages[loadingMessageIdx]} />
          )}

          {/* Step 4: Display Premium Admission Report */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Quick Sharing Header */}
              <div className="no-print" style={{
                backgroundColor: "white",
                padding: "24px 32px",
                borderRadius: "24px",
                border: "1px solid #ECE0D1",
                boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#10B981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: "20px", height: "20px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "13px", fontWeight: 900, color: "#111827", margin: 0 }}>진단 리포트가 정상 발행되었습니다</h3>
                    <p style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "bold", margin: "2px 0 0" }}>발행번호: {reportIssueNumber}</p>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      color: "#4B5563",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    텍스트 공유 복사
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      color: "#4B5563",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer"
                    }}
                  >
                    다시 진단하기
                  </button>
                </div>
              </div>

              {/* Embedded Premium Report Component via Step4 */}
              <Step4
                userInfo={{
                  name: userInfo?.studentName || "학생",
                  grade: userInfo?.grade || "고3",
                  score: String(userInfo?.studentIndex || "2.5"),
                }}
                evaluated={evaluated}
                onReset={() => setStep(2)}
              />

              {/* Bottom Actions after Report */}
              <div className="no-print" style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "32px",
                border: "1px solid #ECE0D1",
                boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 900, color: "#111827", marginBottom: "6px", margin: 0 }}>
                    생기부 기반 세부능력 및 특기사항 추천이 필요하신가요?
                  </h4>
                  <p style={{ fontSize: "11px", color: "#6B7280", fontWeight: "bold", margin: 0 }}>
                    AI 세특 메이커를 통해 진로에 최적화된 독자 연구 주제와 학술적 생기부 키워드를 매칭받으세요.
                  </p>
                </div>
                <Link
                  href="/setuk"
                  className="btn-premium"
                  style={{ padding: "12px 28px", fontSize: "12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  AI 세특 메이커 시작하기
                </Link>
              </div>
            </div>
          )}
      </div>
      </div>
    </div>
  );
}
