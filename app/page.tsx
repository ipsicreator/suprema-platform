"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, LineChart, FileText, Target, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div style={{ 
      backgroundColor: "#FDFBF7", 
      minHeight: "100vh", 
      fontFamily: "'Pretendard', sans-serif",
      position: "relative",
      paddingBottom: "120px"
    }}>
      
      {/* Top Navigation */}
      <nav style={{ 
        width: "100%", 
        maxWidth: "1150px", 
        margin: "0 auto", 
        padding: "30px 40px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: "1px solid rgba(236, 224, 209, 0.5)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#D4AF37" }}>대치</span>
            <h1 style={{ fontSize: "32px", fontWeight: 950, color: "#1a0f08", margin: 0, letterSpacing: "-0.05em" }}>수프리마</h1>
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", letterSpacing: "0.02em" }}>
            Su·Prima 입시&코칭 센터
          </span>
        </div>
        
        {/* 명확하고 직관적인 센터소개 버튼 */}
        <Link href="/intro" style={{
          padding: "12px 28px",
          backgroundColor: "white",
          color: "#8B1A1A",
          border: "2px solid #8B1A1A",
          borderRadius: "30px",
          fontSize: "15px",
          fontWeight: 800,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 10px 20px rgba(139, 26, 26, 0.05)",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#8B1A1A";
          e.currentTarget.style.color = "white";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.color = "#8B1A1A";
        }}>
          센터소개 (8P) 열람하기 <FileText size={18} />
        </Link>
      </nav>

      {/* Hero Title Section */}
      <header style={{ textAlign: "center", padding: "80px 20px 50px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ fontSize: "46px", fontWeight: 900, color: "#1a0f08", letterSpacing: "-0.04em", marginBottom: "16px" }}>
          학생부 AI분석·입시전략 플랫폼
        </h2>
        <div style={{ 
          padding: "6px 20px", 
          backgroundColor: "rgba(139, 26, 26, 0.05)", 
          borderRadius: "20px",
          color: "#8B1A1A",
          fontWeight: 800,
          fontSize: "18px",
          marginBottom: "30px",
          letterSpacing: "0.05em"
        }}>
          BY 수프리마
        </div>
        <p style={{ fontSize: "17px", fontWeight: 600, color: "#4B5563", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto" }}>
          AI 탐구·세특 플랫폼과 정밀한 입시 위치 진단으로<br />
          학생의 숨겨진 강점을 발견하고, 최적의 합격 전략을 설계합니다.
        </p>
      </header>

      {/* Feature Badges */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "16px", 
        marginBottom: "60px", 
        padding: "0 20px",
        flexWrap: "wrap" 
      }}>
        {[
          { icon: <ShieldCheck size={24} color="#D4AF37" />, title: "교육 데이터 기반 AI", desc: "신뢰도 높은 분석 결과" },
          { icon: <Users size={24} color="#D4AF37" />, title: "AI + 전문가 하이브리드", desc: "정확하고 실전적인 전략" },
          { icon: <LineChart size={24} color="#D4AF37" />, title: "입시 전략 토탈 케어", desc: "진단부터 전략까지 한 번에" }
        ].map((badge, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "20px 30px",
            backgroundColor: "white",
            border: "1px solid #ECE0D1",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
          }}>
            <div style={{ padding: "12px", backgroundColor: "#FDFBF7", borderRadius: "14px" }}>
              {badge.icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#1a0f08", marginBottom: "4px" }}>{badge.title}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>{badge.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Core Cards Grid */}
      <div style={{ 
        width: "100%", 
        maxWidth: "1150px", 
        margin: "0 auto", 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: "24px", 
        padding: "0 40px" 
      }}>
        {[
          { num: "01", icon: <BrainCircuit size={48} strokeWidth={1.5} />, title: "교육 데이터 기반 AI", desc: "수많은 축적된 입시 데이터를 기반으로 신뢰성 높은 결과를 제공합니다." },
          { num: "02", icon: <Users size={48} strokeWidth={1.5} />, title: "AI + 전문가 하이브리드", desc: "AI 분석과 입시 전문가의 검토를 결합해 실전에서 통하는 방향을 제시합니다." },
          { num: "03", icon: <FileText size={48} strokeWidth={1.5} />, title: "완성도 높은 세특 문장", desc: "활동 내용이 아닌 역량과 성과 중심의 설득력 있는 문장을 제공합니다." },
          { num: "04", icon: <Target size={48} strokeWidth={1.5} />, title: "입시 전략 토탈 케어", desc: "탐구 주제 발굴부터 세특 완성, 입시 전략 수립까지 한 번에 관리합니다." }
        ].map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: "white",
            padding: "40px 30px",
            borderRadius: "24px",
            boxShadow: "0 20px 40px rgba(44, 26, 10, 0.04)",
            border: "1px solid #ECE0D1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.boxShadow = "0 30px 60px rgba(139, 26, 26, 0.08)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(44, 26, 10, 0.04)";
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: "#A13E17", color: "white",
              display: "flex", justifyContent: "center", alignItems: "center",
              fontWeight: 900, fontSize: "16px", alignSelf: "flex-start", marginBottom: "20px"
            }}>
              {card.num}
            </div>
            <div style={{ color: "#5D4D3D", marginBottom: "24px" }}>
              {card.icon}
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1a0f08", marginBottom: "16px", wordBreak: "keep-all" }}>
              {card.title}
            </h3>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280", lineHeight: 1.6, wordBreak: "keep-all" }}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Floating CTA Button (진단 시작하기) */}
      <div style={{ 
        position: "fixed", 
        bottom: "40px", 
        left: "0", 
        width: "100%", 
        display: "flex", 
        justifyContent: "center", 
        zIndex: 100,
        pointerEvents: "none" // allow clicking through the container
      }}>
        <Link href="/diagnosis" style={{
          padding: "20px 60px",
          backgroundColor: "#8B1A1A",
          color: "white",
          fontSize: "20px",
          fontWeight: 900,
          borderRadius: "50px",
          textDecoration: "none",
          boxShadow: "0 20px 40px rgba(139, 26, 26, 0.3), 0 0 0 8px rgba(139, 26, 26, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          pointerEvents: "auto", // re-enable clicks for the button
          transition: "all 0.3s ease"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.backgroundColor = "#660000";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = "#8B1A1A";
        }}>
          AI 입시 위치 진단 시작하기 <ArrowRight strokeWidth={3} />
        </Link>
      </div>

    </div>
  );
}
