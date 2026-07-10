"use client";

import { useState } from "react";
import { Search, Activity } from "lucide-react";
import FlowShell from "@/app/components/FlowShell";
import AppFooter from "@/app/components/AppFooter";
import { EvaluationSimulation, PositionDiagnosis } from "../components/admission";
import { diagnosisSteps } from "./steps";

export default function DiagnosisPage() {
  const [activeTab, setActiveTab] = useState<"search" | "simulation">("search");

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title="입시위치진단"
      subtitle="학생부 분석 결과를 바탕으로 희망대학 매칭 진단과 입학사정관 평가 흐름을 한 화면에서 확인합니다."
      steps={diagnosisSteps}
      currentStep={4}
      footer={<AppFooter />}
    >
      <div className="mx-auto max-w-[1120px] space-y-6">
        <div className="rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5">
          <div className="flex flex-wrap gap-3 border-b border-[#eadfce] pb-4">
            <button
              onClick={() => setActiveTab("search")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition-colors",
                activeTab === "search" ? "bg-[#8b1a1a] text-white" : "border border-[#d9c8b3] bg-white text-[#4b5563]",
              ].join(" ")}
            >
              <Search size={18} />
              입시위치진단
            </button>

            <button
              onClick={() => setActiveTab("simulation")}
              className={[
                "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition-colors",
                activeTab === "simulation" ? "bg-[#4f46e5] text-white" : "border border-[#d9c8b3] bg-white text-[#4b5563]",
              ].join(" ")}
            >
              <Activity size={18} />
              입학사정관 평가
            </button>
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-[#6c6256]">
            학생이 직접 선택한 희망대학을 기준으로 결과를 확인하고, 추가로 입학사정관 평가까지 이어서 볼 수 있습니다.
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-[#eadfce] bg-white shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
          <div className="p-4 md:p-6">
            {activeTab === "search" ? <PositionDiagnosis /> : <EvaluationSimulation />}
          </div>
        </div>
      </div>
    </FlowShell>
  );
}
