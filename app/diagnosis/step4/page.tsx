"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import FlowShell from "@/app/components/FlowShell";
import AppFooter from "@/app/components/AppFooter";
import { buildStep4SessionPayload, createNextUniversityTarget, summarizeJudgments } from "@/lib/step4-storage";
import { diagnosisSteps } from "../steps";

type Judgment = "하향" | "안정" | "도전" | "불가";

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
    judgment: "도전",
    reason: "학생부 주제와 전공 적합성은 좋지만 최근 합격 기준과 비교하면 추가 보완이 필요합니다.",
  },
  {
    id: "target-2",
    university: "연세대학교",
    department: "경영학과",
    trackType: "학생부교과",
    admissionName: "추천형",
    judgment: "안정",
    reason: "중간권 성적과 전공 관심이 잘 맞아 비교적 안정적으로 판단됩니다.",
  },
  {
    id: "target-3",
    university: "고려대학교",
    department: "경제학과",
    trackType: "학생부종합",
    admissionName: "학업우수형",
    judgment: "불가",
    reason: "현재 성적과 학생부 구성만으로는 합격 추천이 어려운 단계로 보입니다.",
  },
];

const judgmentStyle: Record<Judgment, string> = {
  하향: "bg-sky-50 text-sky-700 border-sky-200",
  안정: "bg-emerald-50 text-emerald-700 border-emerald-200",
  도전: "bg-amber-50 text-amber-700 border-amber-200",
  불가: "bg-rose-50 text-rose-700 border-rose-200",
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

  function saveStep4State(nextTargets: UniversityTarget[], nextOpenId: string, nextEmail: string) {
    try {
      sessionStorage.setItem("diagnosis_step4_state", JSON.stringify(buildStep4SessionPayload({ targets: nextTargets, openId: nextOpenId, email: nextEmail })));
    } catch {}
  }

  function addTarget() {
    const nextIndex = targets.length + 1;
    const next: UniversityTarget = createNextUniversityTarget(nextIndex);
    const nextTargets = [...targets, next];
    setTargets(nextTargets);
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
      setStatus("메일 주소를 입력해 주세요.");
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
      setStatus(result?.message || (response.ok ? "메일 발송이 완료되었습니다." : "메일 발송에 실패했습니다."));
      saveStep4State(targets, openId, trimmed);
    } catch {
      setStatus("메일 발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title="입시 위치 진단"
      subtitle="학생부 기반으로 대학별 진단 결과를 보여줍니다."
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
            <button onClick={() => setMailOpen((prev) => !prev)} className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]">메일 보내기</button>
            <button onClick={handleResetTargets} className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-5 py-3 text-sm font-black text-[#3f3f46]">4단계 초기화</button>
          </div>
          {mailOpen ? (
            <div className="mt-4 flex w-full flex-wrap gap-2">
              <input type="email" value={email} onChange={(event) => { const nextEmail = event.target.value; setEmail(nextEmail); saveStep4State(targets, openId, nextEmail); }} placeholder="메일 주소 입력" className="min-w-[260px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700" />
              <button onClick={handleSendMail} disabled={sending} className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                {sending ? "발송 중" : "4단계 결과 발송"}
              </button>
            </div>
          ) : null}
        </div>

        {status ? <div className="mb-4 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a] print:hidden">{status}</div> : null}

        <section className="mb-4 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5">
          <div className="mb-4">
            <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">진단계요약</div>
            <h3 className="mt-1 text-lg font-black text-[#1f1720]">1 · 2 · 3단계 결과 묶음</h3>
            <p className="mt-1 text-sm font-semibold text-[#6c6256]">이전 단계 정보와 탐구 결과를 함께 보면서 대학별 판단 근거를 확인합니다.</p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <SummaryCard title="입시 위치 진단" heading="학생정보입력">
              {String(profile?.studentName || "학생명 없음")} · {String(profile?.schoolName || "학교명 없음")}
            </SummaryCard>
            <SummaryCard title="입시 위치 진단" heading="학생부 분석">
              희망 진로 {String(profile?.careerHint || "정보 없음")} · 내신 {String(profile?.studentIndex || "-")} 기준
            </SummaryCard>
            <SummaryCard title="입시 위치 진단" heading="탐구활동/독서/세특">
              총 {step3Bundle?.topics?.length || 0}개 주제를 입시위치 진단과 함께 연결합니다.
            </SummaryCard>
          </div>

          {step3Bundle?.topics?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {step3Bundle.topics.slice(0, 6).map((topic, index) => (
                <div key={topic.id} className="rounded-2xl border border-[#eadfce] bg-white p-4">
                  <div className="text-xs font-black tracking-[0.12em] text-[#8b1a1a]">주제 {index + 1}</div>
                  <div className="mt-2 text-base font-black leading-6 text-[#1f1720]">{topic.topic_title}</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{topic.setuk_sentence}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="space-y-4">
          {targets.map((target, index) => (
            <section key={target.id} className="overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fffdf8]">
              <button type="button" onClick={() => handleToggleOpen(target.id)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left">
                <div>
                  <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">UNIVERSITY {index + 1}</div>
                  <h3 className="mt-1 text-lg font-black text-[#1f1720]">{target.university} · {target.department}</h3>
                </div>
                <span className={`rounded-full border px-4 py-2 text-sm font-black ${judgmentStyle[target.judgment]}`}>{target.judgment}</span>
              </button>

              {openId === target.id ? (
                <div className="border-t border-[#eadfce] p-5">
                  <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
                    <EditableField label="희망대학" value={target.university} onChange={(value) => updateTarget(target.id, "university", value)} />
                    <EditableField label="모집단위" value={target.department} onChange={(value) => updateTarget(target.id, "department", value)} />
                    <EditableField label="전형유형" value={target.trackType} onChange={(value) => updateTarget(target.id, "trackType", value)} />
                    <EditableField label="전형명" value={target.admissionName} onChange={(value) => updateTarget(target.id, "admissionName", value)} />
                    <label className="text-sm font-black text-[#1f1720]">
                      판정
                      <select value={target.judgment} onChange={(event) => updateTarget(target.id, "judgment", event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-bold print:hidden">
                        {(["하향", "안정", "도전", "불가"] as Judgment[]).map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                      <span className="mt-2 hidden rounded-xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-bold print:block">{target.judgment}</span>
                    </label>
                    <EditableField label="진단 근거" value={target.reason} onChange={(value) => updateTarget(target.id, "reason", value)} wide />
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-3 print:hidden">
          <button onClick={addTarget} className="rounded-full border border-[#8b1a1a] bg-white px-6 py-4 text-sm font-black text-[#8b1a1a]">희망대학 추가</button>
          <div className="flex gap-3">
            <Link href="/diagnosis/step3" className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black text-[#3f3f46]">이전 단계</Link>
            <Link href="/diagnosis" className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white">최종 결과 페이지</Link>
          </div>
        </div>
      </div>
    </FlowShell>
  );
}

function SummaryCard({ title, heading, children }: { title: string; heading: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
      <div className="text-xs font-black tracking-[0.12em] text-[#8b1a1a]">{title}</div>
      <div className="mt-2 text-base font-black text-[#1f1720]">{heading}</div>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{children}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm font-black text-[#1f1720] ${wide ? "md:col-span-2 print:col-span-2" : ""}`}>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700 print:hidden" />
      <span className="mt-2 hidden rounded-xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-semibold text-slate-700 print:block">{value}</span>
    </label>
  );
}
