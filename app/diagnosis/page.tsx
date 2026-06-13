"use client";

import { useState } from "react";
import { EvaluationSimulation, PositionDiagnosis } from "../components/admission";
import { Search, Activity } from "lucide-react";

export default function DiagnosisPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'simulation'>('search');

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>입시위치 진단 및 시뮬레이션</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          실제 입결 데이터를 기반으로 합격 가능성을 진단하고 세특 역전 시뮬레이션을 수행합니다.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: activeTab === 'search' ? "#3b82f6" : "#f1f5f9",
              color: activeTab === 'search' ? "#fff" : "#475569",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s"
            }}
          >
            <Search size={18} /> 입결 검색기
          </button>
          
          <button
            onClick={() => setActiveTab('simulation')}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: activeTab === 'simulation' ? "#4f46e5" : "#f1f5f9",
              color: activeTab === 'simulation' ? "#fff" : "#475569",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s"
            }}
          >
            <Activity size={18} /> 고교 유형별 합산 시뮬레이션
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {activeTab === 'search' ? (
          <PositionDiagnosis />
        ) : (
          <EvaluationSimulation />
        )}
      </div>
    </div>
  );
}
