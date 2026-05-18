"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import ReportComponent from "../diagnosis/report";

export default function ReportPage() {
  // In a real scenario, this data would be fetched from the database using a URL parameter (e.g. ?id=123)
  // For the standalone template display, we provide placeholder premium data.
  const sampleStudentInfo = {
    name: "김수프",
    grade: "고3",
    score: "2.1",
  };

  const sampleResults = [
    {
      university: "서울대학교",
      department: "컴퓨터공학부",
      track_name: "학생부종합(일반전형)",
      level: "적정",
      y23: "1.9",
      y24: "2.0",
      y25: "2.1",
      trend: "down",
      comment: "해당 전공의 최근 3개년 합격 컷이 하락 추세에 있으며, 지원자의 심화 탐구 역량이 학생부종합 전형에서 강점으로 작용할 수 있습니다."
    },
    {
      university: "연세대학교",
      department: "인공지능학과",
      track_name: "학생부교과(추천형)",
      level: "상향",
      y23: "1.5",
      y24: "1.6",
      y25: "1.6",
      trend: "up",
      comment: "교과 성적이 합격 컷 대비 다소 부족하나, 면접 등 2단계 전형에서의 만회가 필수적으로 요구되는 상향 지원 구간입니다."
    }
  ];

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--suprima-cream)", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      padding: "32px 0", 
      boxSizing: "border-box", 
      fontFamily: "Pretendard, -apple-system, sans-serif" 
    }}>
      
      {/* Standalone Report Frame - 1150px Widescreen Wapper */}
      <div id="standalone-report-wrapper" style={{
        width: "100%",
        maxWidth: "1150px",
        backgroundColor: "white",
        borderRadius: "40px",
        border: "1px solid #ECE0D1",
        boxShadow: "0 30px 80px rgba(44, 26, 10, 0.05)",
        padding: "40px 48px",
        boxSizing: "border-box",
        position: "relative"
      }}>
        {/* Premium Top Border */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "linear-gradient(to right, var(--suprima-burgundy), var(--suprima-gold))", borderTopLeftRadius: "40px", borderTopRightRadius: "40px" }} />
        
        {/* Navigation & Branding Header (Hidden on Print) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ECE0D1", paddingBottom: "24px", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/diagnosis" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B7280", fontSize: "12px", fontWeight: "bold", textDecoration: "none", backgroundColor: "#F9FAFB", padding: "8px 16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}>
              <ArrowLeft className="w-4 h-4" /> 뒤로가기
            </Link>
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <Image 
                src="/suprema-logo.png" 
                alt="대치 수프리마 Su-Prima" 
                width={140} 
                height={38} 
                priority
                style={{ objectFit: "contain" }}
              />
            </Link>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "900", color: "#9CA3AF", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Standalone Report View
          </span>
        </div>

        {/* Embedded Premium Report Component */}
        <ReportComponent
          studentInfo={sampleStudentInfo}
          results={sampleResults}
        />
      </div>
    </div>
  );
}
