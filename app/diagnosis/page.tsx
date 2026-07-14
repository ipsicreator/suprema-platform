"use client";

import { useEffect, useState } from "react";
import { Search, Activity } from "lucide-react";
import FlowShell from "@/app/components/FlowShell";
import AppFooter from "@/app/components/AppFooter";
import { readDiagnosisSessionSnapshot } from "@/lib/diagnosis-session";
import { summarizeJudgments } from "@/lib/step4-storage";
import { formatGradePair } from "@/lib/user-info";
import { EvaluationSimulation, PositionDiagnosis } from "../components/admission";
import { diagnosisSteps } from "./steps";

export default function DiagnosisPage() {
  const [activeTab, setActiveTab] = useState<"search" | "simulation">("search");
  const [snapshot] = useState(() => readDiagnosisSessionSnapshot());

  useEffect(() => {
    try {
      if (snapshot.userInfo) {
        window.localStorage.setItem(
          "student_info_diagnosis-session",
          JSON.stringify({
            name: snapshot.userInfo.studentName || "",
            schoolName: snapshot.userInfo.schoolName || "",
            gpa: formatGradePair(snapshot.userInfo),
          }),
        );
      }
    } catch {}
  }, [snapshot]);

  const topicCount = snapshot.step3?.topics?.length || 0;
  const targetCount = snapshot.step4?.targets?.length || 0;
  const step4Summary = !snapshot.step4?.targets?.length ? "아직 4단계 결과가 없습니다." : summarizeJudgments(snapshot.step4.targets);

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
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            eyebrow="1단계"
            title="학생정보입력"
            text={[
              snapshot.userInfo?.studentName || "학생명 없음",
              snapshot.userInfo?.schoolName || "학교명 없음",
              snapshot.userInfo?.careerHint || "희망 진로 정보 없음",
            ].join(" · ")}
          />
          <SummaryCard
            eyebrow="2단계"
            title="학생부 분석"
            text={`내신 ${formatGradePair(snapshot.userInfo)} · 메모 ${snapshot.step2Memo ? "저장됨" : "없음"}`}
          />
          <SummaryCard
            eyebrow="3단계"
            title="탐구활동/독서/세특"
            text={`주제 ${topicCount}개 · 메일 ${snapshot.step3Email || snapshot.userInfo?.email || "없음"}`}
          />
          <SummaryCard
            eyebrow="4단계"
            title="입시위치 진단"
            text={targetCount ? `희망대학 ${targetCount}개 · ${step4Summary}` : "저장된 대학 진단 없음"}
          />
        </section>

        {snapshot.step3?.topics?.length ? (
          <section className="rounded-[28px] border border-[#eadfce] bg-white p-5 shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfce] pb-4">
              <div>
                <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">STEP SUMMARY</div>
                <h2 className="mt-1 text-xl font-black text-[#1a0f08]">3단계와 4단계 연결 결과</h2>
              </div>
              <div className="text-sm font-semibold text-[#6c6256]">{step4Summary}</div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {snapshot.step3.topics.slice(0, 4).map((topic, index) => (
                <article key={topic.id} className="rounded-[22px] border border-[#eadfce] bg-[#fffaf4] p-4">
                  <div className="text-xs font-black tracking-[0.12em] text-[#8b1a1a]">주제 {index + 1}</div>
                  <h3 className="mt-2 text-base font-black text-[#1f1720]">{topic.topic_title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{topic.setuk_sentence}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

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
            {activeTab === "search" ? (
              <PositionDiagnosis
                studentData={
                  snapshot.userInfo?.studentName
                    ? { id: "diagnosis-session", name: snapshot.userInfo.studentName }
                    : null
                }
              />
            ) : (
              <EvaluationSimulation
                studentData={
                  snapshot.userInfo?.studentName
                    ? { id: "diagnosis-session", name: snapshot.userInfo.studentName }
                    : null
                }
              />
            )}
          </div>
        </div>
      </div>
    </FlowShell>
  );
}

function SummaryCard({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="rounded-[24px] border border-[#eadfce] bg-white p-5 shadow-[0_10px_30px_rgba(44,26,10,0.04)]">
      <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">{eyebrow}</div>
      <h2 className="mt-2 text-lg font-black text-[#1a0f08]">{title}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#6c6256]">{text}</p>
    </section>
  );
}
