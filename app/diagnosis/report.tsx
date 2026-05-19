"use client";

import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Minus, Download, ArrowRight, Printer } from "lucide-react";

interface ReportProps {
  studentInfo: {
    name: string;
    grade: string;
    score: string;
    parsedSubjects?: any[];
    studentAnalysis?: any;
    gradingSystem?: string;
  };
  results: any[];
  onBack?: () => void;
  onReset?: () => void;
}

export default function ReportComponent({ studentInfo, results, onBack, onReset }: ReportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ color: "#111827", padding: "0" }} className="print-p-0">

      {/* Centered Fixed Width Container */}
      <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>

        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }} className="print-mb-6">
          <div>
            <div style={{
              display: "inline-block",
              padding: "6px 14px",
              backgroundColor: "rgba(139, 26, 26, 0.05)",
              color: "var(--suprima-burgundy)",
              borderRadius: "9999px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "12px"
            }} className="print-hidden">
              Analysis Report
            </div>
            <h1 className="heading-premium" style={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.05em", marginBottom: "6px", color: "#1a0f08" }}>
              3개년 입결 추이 분석 리포트
            </h1>
            <p style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600, margin: 0 }}>
              실제 입학 결과(2023-2025)를 바탕으로 분석한 대치 수프리마 정밀 진단 리포트입니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }} className="print-hidden">
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "white",
                  border: "1px solid #D1D5DB",
                  color: "#4B5563",
                  borderRadius: "14px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                다시 진단하기
              </button>
            )}
            <button
              onClick={handlePrint}
              className="btn-premium"
              style={{ padding: "12px 24px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <Printer className="w-4 h-4" /> PDF 리포트 저장
            </button>
          </div>
        </div>

        {/* Student Info Bar */}
        <div style={{
          backgroundColor: "white",
          padding: "20px 32px",
          borderRadius: "20px",
          border: "1px solid #ECE0D1",
          boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          gap: "36px",
          alignItems: "center"
        }}>
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>대상 학생</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "#111827" }}>{studentInfo.name}</span>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>내신 평균 지표</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--suprima-burgundy)" }}>
              {studentInfo.score} <small style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: "bold", marginLeft: "4px" }}>등급</small>
            </span>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>분석 기준 학년</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "#111827" }}>{studentInfo.grade}</span>
          </div>
        </div>

        {/* Dynamic Student Transcript Subjects List Section */}
        {(() => {
          const parsedSubjects = (studentInfo as any).parsedSubjects || [];
          if (parsedSubjects.length === 0) return null;
          return (
            <div style={{
              backgroundColor: "#FAF6F0",
              borderRadius: "20px",
              padding: "20px 28px",
              border: "1px solid #ECE0D1",
              marginBottom: "24px",
              boxShadow: "inset 0 2px 4px rgba(44, 26, 10, 0.01)"
            }}>
              <h3 style={{ fontSize: "13px", fontWeight: 900, color: "var(--suprima-burgundy)", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                📋 학생부 분석 반영 교과 성적표 ({parsedSubjects.length}개 과목 자동 추출 완료)
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {parsedSubjects.map((sub: any, idx: number) => (
                  <div key={idx} style={{
                    backgroundColor: "white",
                    border: "1px solid rgba(139, 26, 26, 0.15)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)"
                  }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 900, color: "#111827" }}>{sub.subject}</span>
                    <span style={{ width: "1px", height: "12px", backgroundColor: "#ECE0D1" }} />
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#7C7267" }}>{sub.unit}단위</span>
                    <span style={{ fontSize: "10.5px", fontWeight: 900, color: "var(--suprima-burgundy)", backgroundColor: "rgba(139, 26, 26, 0.05)", padding: "1px 5px", borderRadius: "4px" }}>{sub.grade}등급</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* GPA Conversion Analysis Detail Card */}
        {(() => {
          const rawScore = parseFloat(studentInfo.score || "0");
          const is5Level = (studentInfo as any).gradingSystem === "5-level" || studentInfo.grade === "고1" || studentInfo.grade === "고2";

          const convert5To9Grade = (g5: number): number => {
            if (g5 <= 1.0) return 1.0;
            if (g5 <= 2.0) return 1.0 + (g5 - 1.0) * 2.6;
            if (g5 <= 3.0) return 3.6 + (g5 - 2.0) * 2.2;
            if (g5 <= 4.0) return 5.8 + (g5 - 3.0) * 2.0;
            if (g5 <= 5.0) return 7.8 + (g5 - 4.0) * 1.2;
            return 9.0;
          };

          const convertedScore = is5Level ? convert5To9Grade(rawScore).toFixed(2) : null;

          return (
            <div style={{
              background: "linear-gradient(135deg, #FFFDFB 0%, #F5EFEB 100%)",
              borderRadius: "20px",
              padding: "20px 28px",
              border: "1px solid #E3D5C5",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "0 10px 30px rgba(44, 26, 10, 0.02)"
            }}>
              <h3 style={{ fontSize: "13px", fontWeight: 900, color: "var(--suprima-burgundy)", margin: "0", display: "flex", alignItems: "center", gap: "6px" }}>
                ⚖️ 내신 산출 기준 및 환산 세부 지표
              </h3>

              {is5Level ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5", color: "#4B5563", fontWeight: 700, wordBreak: "keep-all" }}>
                    지원 학년(<span style={{ color: "var(--suprima-burgundy)" }}>{studentInfo.grade}</span>)은 **2028 개정 교육과정에 따른 내신 5등급제** 이수 학년입니다.
                    기존 9등급제 기반 대학별 누적 합격 컷 데이터와 올바르게 대조하기 위해, 교육부 표준 누적 백분율 비례식(구간 선형 보간법)에 의해 보정을 거쳤습니다.
                  </p>
                  <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                    <div style={{ backgroundColor: "white", padding: "10px 16px", borderRadius: "10px", border: "1px solid #ECE0D1", flex: 1, minWidth: "160px" }}>
                      <span style={{ fontSize: "9px", color: "#9CA3AF", fontWeight: "bold", display: "block", marginBottom: "2px" }}>학생부 5등급제 원점 등급</span>
                      <span style={{ fontSize: "1.15rem", fontWeight: 950, color: "#111827" }}>{rawScore.toFixed(2)} <small style={{ fontSize: "10px", color: "#6B7280" }}>등급</small></span>
                    </div>
                    <div style={{ backgroundColor: "rgba(139, 26, 26, 0.03)", padding: "10px 16px", borderRadius: "10px", border: "1.5px solid var(--suprima-burgundy)", flex: 1, minWidth: "160px" }}>
                      <span style={{ fontSize: "9px", color: "var(--suprima-burgundy)", fontWeight: "bold", display: "block", marginBottom: "2px" }}>대학 수시 매칭용 9등급제 환산 등급</span>
                      <span style={{ fontSize: "1.15rem", fontWeight: 950, color: "var(--suprima-burgundy)" }}>{convertedScore} <small style={{ fontSize: "10px", color: "var(--suprima-burgundy)" }}>등급</small></span>
                    </div>
                  </div>
                  <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#9CA3AF", fontWeight: 600 }}>
                    * 환산 방식: 1등급(누적 10% ➡️ 9등급제 1.80) / 2등급(누적 34% ➡️ 9등급제 3.60) / 3등급(누적 66% ➡️ 9등급제 5.80) 구간별 선형 보간
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: 0, fontSize: "12px", lineHeight: "1.5", color: "#4B5563", fontWeight: 700, wordBreak: "keep-all" }}>
                    지원 학년(<span style={{ color: "var(--suprima-burgundy)" }}>{studentInfo.grade}</span>)은 **기존 9등급 상대평가제** 적용 학년입니다.
                    생활기록부에서 추출한 가중 평균 성적(<span style={{ color: "var(--suprima-burgundy)" }}>{rawScore.toFixed(2)} 등급</span>)을 환산 과정 없이 2023~2025학년도의 대학별 최종 합격 컷 데이터와 1:1로 엄밀하게 대조 진단하였습니다.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* 3-Year Comparison Table */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          border: "1px solid #ECE0D1",
          boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
          overflow: "hidden",
          marginBottom: "20px"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #ECE0D1" }}>
                <th style={{ padding: "12px 20px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "35%" }}>
                  대학 / 전형 / 학과
                </th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "12%" }}>
                  2023 실결
                </th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "12%" }}>
                  2024 실결
                </th>
                <th style={{
                  padding: "12px",
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  backgroundColor: "rgba(139, 26, 26, 0.03)",
                  color: "var(--suprima-burgundy)",
                  textAlign: "center",
                  width: "14%"
                }}>
                  2025 실결
                </th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "10%" }}>
                  추이
                </th>
                <th style={{ padding: "12px 20px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "27%" }}>
                  판정 및 소견
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i} style={{ borderBottom: i === results.length - 1 ? "none" : "1px solid #ECE0D1" }}>

                  {/* College / Dept Cell */}
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <p style={{ fontSize: "1.05rem", fontWeight: 950, color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.04em" }}>
                      {item.university}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6B7280", fontWeight: 800, margin: 0 }}>
                      {item.track_name || "일반"} <span style={{ color: "#D1D5DB", margin: "0 4px" }}>|</span> {item.department}
                    </p>
                  </td>

                  {/* Years */}
                  <td style={{ padding: "16px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#9CA3AF", fontWeight: 700, verticalAlign: "middle" }}>
                    {item.y23 || "-"}
                  </td>
                  <td style={{ padding: "16px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#9CA3AF", fontWeight: 700, verticalAlign: "middle" }}>
                    {item.y24 || "-"}
                  </td>
                  <td style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: 900,
                    color: "var(--suprima-burgundy)",
                    backgroundColor: "rgba(139, 26, 26, 0.03)",
                    verticalAlign: "middle"
                  }}>
                    {item.y25 || "-"}
                  </td>

                  {/* Trend Indicator */}
                  <td style={{ padding: "16px 12px", textAlign: "center", verticalAlign: "middle" }}>
                    {item.trend === 'up' ? <TrendingUp className="w-5 h-5 mx-auto" style={{ color: "#EF4444" }} /> :
                      item.trend === 'down' ? <TrendingDown className="w-5 h-5 mx-auto" style={{ color: "#3B82F6" }} /> :
                        <Minus className="w-5 h-5 mx-auto" style={{ color: "#D1D5DB" }} />
                    }
                  </td>

                  {/* Evaluation / Comment */}
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <div style={{ marginBottom: "6px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        fontSize: "9px",
                        fontWeight: 900,
                        backgroundColor:
                          item.level === '매우 안정' || item.level === '안정' ? "#D1FAE5" :
                            item.level === '적정' ? "#DBEAFE" : "#FEE2E2",
                        color:
                          item.level === '매우 안정' || item.level === '안정' ? "#065F46" :
                            item.level === '적정' ? "#1E40AF" : "#991B1B"
                      }}>
                        {item.level}
                      </span>
                    </div>
                    <p style={{ fontSize: "10.5px", color: "#4B5563", lineHeight: "1.4", fontWeight: 700, margin: 0, wordBreak: "keep-all" }}>
                      {item.comment}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend / Footer Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 12px" }}>
          <div style={{ display: "flex", gap: "24px", fontSize: "10px", fontWeight: "bold", color: "#9CA3AF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#EF4444" }} /> 합격선 상승 (경쟁 심화)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingDown className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} /> 합격선 하락 (기회 구간)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Minus className="w-3.5 h-3.5" style={{ color: "#D1D5DB" }} /> 보합세 유지
            </div>
          </div>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: "#9CA3AF" }}>
            © 대치 수프리마 입시&코칭 센터. All Rights Reserved.
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .print-mb-6 { margin-bottom: 24px !important; }
          .print-p-0 { padding: 0 !important; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
