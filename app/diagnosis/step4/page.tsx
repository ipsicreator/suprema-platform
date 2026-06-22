"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FlowShell from "@/app/components/FlowShell";
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

const defaultTargets: UniversityTarget[] = [
  {
    id: "target-1",
    university: "서울시립대학교",
    department: "건축학부",
    trackType: "학생부종합",
    admissionName: "학교생활기록부종합전형",
    judgment: "도전",
    reason: "학생부 활동 주제와 전공 적합성은 연결되지만 내신 경쟁력 보완이 필요합니다.",
  },
  {
    id: "target-2",
    university: "단국대학교",
    department: "건축공학부",
    trackType: "학생부교과",
    admissionName: "학교추천자전형",
    judgment: "안정",
    reason: "내신 구간과 전공 관련 활동이 유지되고 있어 비교적 안정권으로 판단됩니다.",
  },
  {
    id: "target-3",
    university: "국민대학교",
    department: "건축대학",
    trackType: "학생부종합",
    admissionName: "국민프런티어전형",
    judgment: "하향",
    reason: "현재 성적과 학생부 완성도 기준으로 합격 가능성이 상대적으로 높습니다.",
  },
];

const judgmentStyle: Record<Judgment, string> = {
  하향: "bg-sky-50 text-sky-700 border-sky-200",
  안정: "bg-emerald-50 text-emerald-700 border-emerald-200",
  도전: "bg-amber-50 text-amber-700 border-amber-200",
  불가: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DiagnosisStep4Page() {
  const [targets, setTargets] = useState(defaultTargets);
  const [openId, setOpenId] = useState(defaultTargets[0].id);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [step3Bundle, setStep3Bundle] = useState<Step3Bundle | null>(null);
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("suprema_user_info");
      const step3Raw = sessionStorage.getItem("diagnosis_step3_topics");
      const info = raw ? JSON.parse(raw) : null;
      setProfile(info || null);
      setEmail(info?.email || "");
      setStep3Bundle(step3Raw ? JSON.parse(step3Raw) : null);
    } catch {
      setProfile(null);
      setEmail("");
      setStep3Bundle(null);
    }
  }, []);

  const summary = useMemo(() => {
    const count = targets.reduce<Record<Judgment, number>>(
      (acc, target) => {
        acc[target.judgment] += 1;
        return acc;
      },
      { 하향: 0, 안정: 0, 도전: 0, 불가: 0 },
    );
    return `하향 ${count.하향} · 안정 ${count.안정} · 도전 ${count.도전} · 불가 ${count.불가}`;
  }, [targets]);

  function addTarget() {
    const nextIndex = targets.length + 1;
    const next: UniversityTarget = {
      id: `target-${nextIndex}`,
      university: "희망대학 입력",
      department: "모집단위 입력",
      trackType: "전형유형 선택",
      admissionName: "전형명 입력",
      judgment: "도전",
      reason: "학생이 직접 선택한 희망대학을 성적과 학생부 기준으로 진단합니다.",
    };
    setTargets((prev) => [...prev, next]);
    setOpenId(next.id);
  }

  function updateTarget(id: string, field: keyof UniversityTarget, value: string) {
    setTargets((prev) =>
      prev.map((target) =>
        target.id === id
          ? {
              ...target,
              [field]: value,
            }
          : target,
      ),
    );
  }

  async function handleSendMail() {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("메일주소를 입력하세요.");
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
          subject: "[나의 입시멘토] 전체 진단 결과",
          reportData: {
            service: "나의 입시멘토",
            type: "admission-position-diagnosis",
            targets,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      setStatus(result?.message || (response.ok ? "메일 발송 완료" : "메일 발송 실패"));
    } catch {
      setStatus("메일 발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title="입시위치 진단"
      subtitle="학생이 직접 선택한 희망대학 기준으로 성적과 학생부를 연결해 진단 결과를 제시합니다."
      currentStep={4}
      steps={diagnosisSteps}
    >
      <div className="mx-auto max-w-[980px] rounded-[28px] border border-[#eadfce] bg-white p-6 text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-[#8b1a1a]">FINAL RESULT</div>
            <h2 className="mt-2 text-xl font-black text-[#1a0f08]">희망대학 {targets.length}개 진단</h2>
            <p className="mt-1 text-sm font-semibold text-[#6c6256]">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white">
              인쇄
            </button>
            <button onClick={() => setMailOpen((prev) => !prev)} className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]">
              메일 보내기
            </button>
          </div>
          {mailOpen ? (
            <div className="mt-4 flex w-full flex-wrap gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="메일주소 입력"
                className="min-w-[260px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              />
              <button onClick={handleSendMail} disabled={sending} className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                {sending ? "발송 중" : "전체 결과 발송"}
              </button>
            </div>
          ) : null}
        </div>

        {status ? <div className="mb-4 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a] print:hidden">{status}</div> : null}

        <section className="mb-4 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5">
          <div className="mb-4">
            <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">1 → 2 → 3</div>
            <h3 className="mt-1 text-lg font-black text-[#1f1720]">전 단계 요약</h3>
            <p className="mt-1 text-sm font-semibold text-[#6c6256]">3단계 결과를 포함한 전체 내용을 4단계 입시진단 화면에서 함께 보여줍니다.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
              <div className="text-xs font-black tracking-[0.12em] text-[#8b1a1a]">1단계</div>
              <div className="mt-2 text-base font-black text-[#1f1720]">학생정보입력</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {String(profile?.studentName || "학생명 없음")} · {String(profile?.schoolName || "학교명 없음")}
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
              <div className="text-xs font-black tracking-[0.12em] text-[#8b1a1a]">2단계</div>
              <div className="mt-2 text-base font-black text-[#1f1720]">학생부 분석</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                희망 진로 {String(profile?.careerHint || "정보 없음")} · 내신 {String(profile?.studentIndex || "-")}등급
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
              <div className="text-xs font-black tracking-[0.12em] text-[#8b1a1a]">3단계</div>
              <div className="mt-2 text-base font-black text-[#1f1720]">탐구활동/독서/세특</div>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                총 {step3Bundle?.topics?.length || 0}개 주제를 입시진단과 함께 묶어 전달합니다.
              </p>
            </div>
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
              <button
                type="button"
                onClick={() => setOpenId((prev) => (prev === target.id ? "" : target.id))}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div>
                  <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">UNIVERSITY {index + 1}</div>
                  <h3 className="mt-1 text-lg font-black text-[#1f1720]">
                    {target.university} · {target.department}
                  </h3>
                </div>
                <span className={`rounded-full border px-4 py-2 text-sm font-black ${judgmentStyle[target.judgment]}`}>{target.judgment}</span>
              </button>

              {openId === target.id ? (
                <div className="border-t border-[#eadfce] p-5">
                  <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
                    <EditableField label="대학" value={target.university} onChange={(value) => updateTarget(target.id, "university", value)} />
                    <EditableField label="모집단위" value={target.department} onChange={(value) => updateTarget(target.id, "department", value)} />
                    <EditableField label="전형유형" value={target.trackType} onChange={(value) => updateTarget(target.id, "trackType", value)} />
                    <EditableField label="전형명" value={target.admissionName} onChange={(value) => updateTarget(target.id, "admissionName", value)} />
                    <label className="text-sm font-black text-[#1f1720]">
                      판정
                      <select
                        value={target.judgment}
                        onChange={(event) => updateTarget(target.id, "judgment", event.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-bold print:hidden"
                      >
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
          <button onClick={addTarget} className="rounded-full border border-[#8b1a1a] bg-white px-6 py-4 text-sm font-black text-[#8b1a1a]">
            희망대학 추가
          </button>
          <div className="flex gap-3">
            <Link href="/diagnosis/step3" className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black text-[#3f3f46]">
              이전 단계
            </Link>
            <Link href="/diagnosis" className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white">
              최종 결과 페이지
            </Link>
          </div>
        </div>
      </div>
    </FlowShell>
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
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700 print:hidden"
      />
      <span className="mt-2 hidden rounded-xl border border-[#eadfce] bg-white px-4 py-3 text-sm font-semibold text-slate-700 print:block">{value}</span>
    </label>
  );
}
