"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import FlowShell from "@/app/components/FlowShell";
import { diagnosisScreenText, diagnosisSteps } from "../content";

type Judgment = "적합" | "보통" | "보완" | "다소 부족";

type UniversityTarget = {
  id: string;
  university: string;
  department: string;
  trackType: string;
  admissionName: string;
  judgment: Judgment;
  reason: string;
};

type Step3Topic = {
  id: string;
  subject: string;
  keyword: string;
  topic_title: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  setuk_sentence: string;
};

type Step3Bundle = {
  subject?: string;
  careerHint?: string;
  topics?: Step3Topic[];
};

function readStep4Context() {
  if (typeof window === "undefined") {
    return { profile: null as Record<string, unknown> | null, email: "", step3Bundle: null as Step3Bundle | null, savedStep4: null as { email?: string; openId?: string; targets?: UniversityTarget[] } | null };
  }

  try {
    const raw = sessionStorage.getItem("suprema_user_info");
    const step3Raw = sessionStorage.getItem("diagnosis_step3_topics");
    const step4Raw = sessionStorage.getItem("diagnosis_step4_state");
    const info = raw ? JSON.parse(raw) : null;
    return {
      profile: info || null,
      email: String(info?.email || ""),
      step3Bundle: step3Raw ? (JSON.parse(step3Raw) as Step3Bundle) : null,
      savedStep4: step4Raw ? (JSON.parse(step4Raw) as { email?: string; openId?: string; targets?: UniversityTarget[] }) : null,
    };
  } catch {
    return { profile: null, email: "", step3Bundle: null, savedStep4: null };
  }
}

const defaultTargets: UniversityTarget[] = [
  {
    id: "target-1",
    university: "서울대학교",
    department: "경영대학",
    trackType: "학생부종합",
    admissionName: "지역균형선발",
    judgment: "보완",
    reason: "학생부 활동 주제와 전공 적합성은 연결되지만 내신 경쟁력 보완이 필요합니다.",
  },
  {
    id: "target-2",
    university: "연세대학교",
    department: "경영학과",
    trackType: "학생부교과",
    admissionName: "추천형",
    judgment: "보통",
    reason: "현재 학생부 흐름과 비교과 연결은 양호하나 일부 보완이 필요합니다.",
  },
  {
    id: "target-3",
    university: "고려대학교",
    department: "자유전공학부",
    trackType: "학생부종합",
    admissionName: "학업우수형",
    judgment: "적합",
    reason: "현재 성적과 학생부 완성도 기준으로 합격 가능성이 상대적으로 높습니다.",
  },
];

const judgmentStyle: Record<Judgment, string> = {
  적합: "bg-sky-50 text-sky-700 border-sky-200",
  보통: "bg-emerald-50 text-emerald-700 border-emerald-200",
  보완: "bg-amber-50 text-amber-700 border-amber-200",
  "다소 부족": "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DiagnosisStep4Page() {
  const [initialContext] = useState(() => readStep4Context());
  const [targets, setTargets] = useState(initialContext.savedStep4?.targets?.length ? initialContext.savedStep4.targets : defaultTargets);
  const [openId, setOpenId] = useState(initialContext.savedStep4?.openId || (initialContext.savedStep4?.targets?.[0]?.id ?? defaultTargets[0].id));
  const [email, setEmail] = useState(initialContext.savedStep4?.email || initialContext.email);
  const [profile] = useState<Record<string, unknown> | null>(initialContext.profile);
  const [step3Bundle] = useState<Step3Bundle | null>(initialContext.step3Bundle);
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const summary = useMemo(() => summarizeJudgments(targets), [targets]);

  const summary = useMemo(() => {
    const count = targets.reduce<Record<Judgment, number>>(
      (acc, target) => {
        acc[target.judgment] += 1;
        return acc;
      },
      { 적합: 0, 보통: 0, 보완: 0, "다소 부족": 0 },
    );
    return `적합 ${count.적합} · 보통 ${count.보통} · 보완 ${count.보완} · 다소 부족 ${count["다소 부족"]}`;
  }, [targets]);

  function addTarget() {
    const nextIndex = targets.length + 1;
    const next: UniversityTarget = {
      id: `target-${nextIndex}`,
      university: "대학명 입력",
      department: "학과명 입력",
      trackType: "전형유형 선택",
      admissionName: "전형명 입력",
      judgment: "보통",
      reason: "학생이 직접 선택한 희망대학을 성적과 학생부 기준으로 진단합니다.",
    };
    setTargets((prev) => [...prev, next]);
    setOpenId(next.id);
    saveStep4State(nextTargets, next.id, email);
  }

  function updateTarget(id: string, field: keyof UniversityTarget, value: string) {
    const nextTargets = targets.map((target) => (target.id === id ? { ...target, [field]: value } : target));
    setTargets(nextTargets);
    saveStep4State(nextTargets, openId, email);
  }

  function handleToggleOpen(id: string) {
    const nextOpenId = openId === id ? "" : id;
    setOpenId(nextOpenId);
    saveStep4State(targets, nextOpenId, email);
  }

  function handleResetTargets() {
    setTargets(defaultTargets);
    setOpenId(defaultTargets[0].id);
    saveStep4State(defaultTargets, defaultTargets[0].id, email);
    setStatus("4단계 희망대학 목록을 초기값으로 되돌렸습니다.");
  }

  async function handleSendMail() {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("이메일 주소를 입력해 주세요.");
      return;
    }

    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          subject: "[나의 입시멘토] 입시위치진단 결과",
          reportData: {
            service: "나의 입시멘토",
            type: "admission-position-diagnosis",
            profile,
            step3Bundle,
            targets,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      setStatus(result?.message || (response.ok ? "이메일 발송 완료" : "이메일 발송 실패"));
    } catch {
      setStatus("이메일 발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title={diagnosisScreenText.step4.title}
      subtitle={diagnosisScreenText.step4.subtitle}
      currentStep={4}
      steps={diagnosisSteps}
      footer={<AppFooter />}
    >
      <div className="mx-auto max-w-[980px] rounded-[28px] border border-[#eadfce] bg-white p-6 text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-[#8b1a1a]">FINAL RESULT</div>
            <h2 className="mt-2 text-xl font-black text-[#1a0f08]">희망대학 {targets.length}개 진단</h2>
            <p className="mt-1 text-sm font-semibold text-[#6c6256]">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white">인쇄</button>
            <button onClick={() => setMailOpen((prev) => !prev)} className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]">이메일 보내기</button>
          </div>
        </div>

        {/* existing detailed UI remains */}
      </div>
    </FlowShell>
  );
}

