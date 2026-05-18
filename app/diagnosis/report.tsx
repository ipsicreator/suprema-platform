"use client";

import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Minus, Download, ArrowRight, Printer } from "lucide-react";

interface ReportProps {
  studentInfo: {
    name: string;
    grade: string;
    score: string;
  };
  results: any[];
  onBack?: () => void;
}

export default function ReportComponent({ studentInfo, results, onBack }: ReportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ color: "#111827", padding: "0" }} className="print-p-0">
      
      {/* Centered Fixed Width Container */}
      <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        
        {/* Header Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }} className="print-mb-6">
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
            <h1 className="heading-premium" style={{ fontSize: "2.25rem", fontWeight: 950, letterSpacing: "-0.05em", marginBottom: "8px", color: "#1a0f08" }}>
              3개년 입결 추이 분석 리포트
            </h1>
            <p style={{ color: "#6B7280", fontSize: "13px", fontWeight: 600, margin: 0 }}>
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
          padding: "32px 40px",
          borderRadius: "28px",
          border: "1px solid #ECE0D1",
          boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
          marginBottom: "40px",
          display: "flex",
          flexWrap: "wrap",
          gap: "48px",
          alignItems: "center"
        }}>
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>대상 학생</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 950, color: "#111827" }}>{studentInfo.name}</span>
          </div>
          <div style={{ width: "1px", height: "40px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>내신 평균 지표</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 950, color: "var(--suprima-burgundy)" }}>
              {studentInfo.score} <small style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: "bold", marginLeft: "4px" }}>등급</small>
            </span>
          </div>
          <div style={{ width: "1px", height: "40px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>분석 기준 학년</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 950, color: "#111827" }}>{studentInfo.grade}</span>
          </div>
        </div>

        {/* 3-Year Comparison Table */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "28px",
          border: "1px solid #ECE0D1",
          boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)",
          overflow: "hidden",
          marginBottom: "32px"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #ECE0D1" }}>
                <th style={{ padding: "20px 24px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "35%" }}>
                  대학 / 전형 / 학과
                </th>
                <th style={{ padding: "20px 12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "12%" }}>
                  2023 실결
                </th>
                <th style={{ padding: "20px 12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "12%" }}>
                  2024 실결
                </th>
                <th style={{
                  padding: "20px 12px",
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
                <th style={{ padding: "20px 12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "10%" }}>
                  추이
                </th>
                <th style={{ padding: "20px 24px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "27%" }}>
                  판정 및 소견
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i} style={{ borderBottom: i === results.length - 1 ? "none" : "1px solid #ECE0D1" }}>
                  
                  {/* College / Dept Cell */}
                  <td style={{ padding: "28px 24px", verticalAlign: "middle" }}>
                    <p style={{ fontSize: "1.1rem", fontWeight: 950, color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.04em" }}>
                      {item.university}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6B7280", fontWeight: 800, margin: 0 }}>
                      {item.track_name || "일반"} <span style={{ color: "#D1D5DB", margin: "0 4px" }}>|</span> {item.department}
                    </p>
                  </td>
                  
                  {/* Years */}
                  <td style={{ padding: "28px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#9CA3AF", fontWeight: 700, verticalAlign: "middle" }}>
                    {item.y23 || "-"}
                  </td>
                  <td style={{ padding: "28px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#9CA3AF", fontWeight: 700, verticalAlign: "middle" }}>
                    {item.y24 || "-"}
                  </td>
                  <td style={{
                    padding: "28px 12px",
                    textAlign: "center",
                    fontFamily: "monospace",
                    fontSize: "15px",
                    fontWeight: 900,
                    color: "var(--suprima-burgundy)",
                    backgroundColor: "rgba(139, 26, 26, 0.03)",
                    verticalAlign: "middle"
                  }}>
                    {item.y25 || "-"}
                  </td>
                  
                  {/* Trend Indicator */}
                  <td style={{ padding: "28px 12px", textAlign: "center", verticalAlign: "middle" }}>
                    {item.trend === 'up' ? <TrendingUp className="w-5 h-5 mx-auto" style={{ color: "#EF4444" }} /> : 
                     item.trend === 'down' ? <TrendingDown className="w-5 h-5 mx-auto" style={{ color: "#3B82F6" }} /> : 
                     <Minus className="w-5 h-5 mx-auto" style={{ color: "#D1D5DB" }} />
                    }
                  </td>
                  
                  {/* Evaluation / Comment */}
                  <td style={{ padding: "28px 24px", verticalAlign: "middle" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "10px",
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
                    <p style={{ fontSize: "11px", color: "#4B5563", lineHeight: "1.6", fontWeight: 700, margin: 0, wordBreak: "keep-all" }}>
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
