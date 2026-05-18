"use client";

import { Sparkles } from "lucide-react";

interface Step3Props {
  message: string;
}

export default function Step3({ message }: Step3Props) {
  return (
    <div style={{
      minHeight: "400px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "60px 32px",
      textAlign: "center",
      backgroundColor: "white",
      border: "1px solid #ECE0D1",
      borderRadius: "36px",
      boxShadow: "0 20px 50px rgba(44, 26, 10, 0.04)",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "6px",
        background: "linear-gradient(to right, var(--suprima-burgundy), var(--suprima-gold))"
      }} />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner-active {
          animation: spin 1s linear infinite;
        }
      ` }} />

      {/* Spinner */}
      <div style={{ position: "relative", width: "96px", height: "96px", marginBottom: "40px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid #F3F4F6" }} />
        <div className="spinner-active" style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "4px solid transparent",
          borderTopColor: "var(--suprima-burgundy)",
          borderRightColor: "var(--tw-gradient-to, var(--suprima-gold))"
        }} />
        <div style={{
          position: "absolute",
          inset: "16px",
          borderRadius: "50%",
          backgroundColor: "rgba(139, 26, 26, 0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Sparkles className="w-8 h-8 text-[var(--suprima-burgundy)]" style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
        </div>
      </div>

      <h2 className="heading-premium" style={{ fontSize: "1.65rem", fontWeight: 950, color: "#111827", marginBottom: "12px" }}>
        대치 수프리마 AI 입시 분석 엔진 가동 중
      </h2>
      <p style={{ fontSize: "10px", fontWeight: "bold", color: "var(--suprima-burgundy)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "32px" }}>
        Daechi Admission Bigdata Analysis
      </p>

      <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#4B5563", fontSize: "13px", fontWeight: "bold" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
