"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PrintableReportShell from "@/app/components/PrintableReportShell";

type ExplorationResult = {
  title: string;
  direction: string;
  conclusion_seed: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  report_plan: string[];
  writing_guide: string[];
  section_examples: string[];
  setuk_sentence: string;
  subject: string;
  label: string;
};

type ExplorationMeta = {
  subject?: string;
  careerHint?: string;
  manualKeywordList?: string[];
  studentSignals?: string[];
};

function readExplorationReportContext() {
  if (typeof window === "undefined") {
    return {
      signalResults: [] as ExplorationResult[],
      manualResults: [] as ExplorationResult[],
      meta: {} as ExplorationMeta,
      email: "",
    };
  }

  try {
    const signalRaw = sessionStorage.getItem("suprema_exploration_signal_results");
    const manualRaw = sessionStorage.getItem("suprema_exploration_manual_results");
    const metaRaw = sessionStorage.getItem("suprema_exploration_meta");
    const userInfoRaw = sessionStorage.getItem("suprema_user_info");
    const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;

    return {
      signalResults: signalRaw ? (JSON.parse(signalRaw) as ExplorationResult[]) : [],
      manualResults: manualRaw ? (JSON.parse(manualRaw) as ExplorationResult[]) : [],
      meta: metaRaw ? (JSON.parse(metaRaw) as ExplorationMeta) : {},
      email: String(userInfo?.email || ""),
    };
  } catch {
    return {
      signalResults: [] as ExplorationResult[],
      manualResults: [] as ExplorationResult[],
      meta: {} as ExplorationMeta,
      email: "",
    };
  }
}

export default function ExplorationReportPage() {
  const [initialContext] = useState(() => readExplorationReportContext());
  const [signalResults] = useState<ExplorationResult[]>(initialContext.signalResults);
  const [manualResults] = useState<ExplorationResult[]>(initialContext.manualResults);
  const [meta] = useState<ExplorationMeta>(initialContext.meta);
  const [email, setEmail] = useState(initialContext.email);
  const [emailStatus, setEmailStatus] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const allResults = useMemo(() => [...signalResults, ...manualResults], [signalResults, manualResults]);

  const handleSendEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailStatus("메일주소를 입력하세요.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailStatus("메일주소 형식이 올바르지 않습니다.");
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus("");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          subject: "[나의 입시멘토] 탐구·독서 제안 보고서",
          reportData: { ...meta, results: allResults },
        }),
      });

      const result = await response.json();
      setEmailStatus(result?.message || (response.ok ? "메일 발송 완료" : "메일 발송 실패"));
    } catch {
      setEmailStatus("메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-[#eadfce] bg-white p-6 shadow-[0_24px_70px_rgba(44,26,10,0.08)]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#ece0d1] pb-5 print:hidden">
          <div>
            <div className="inline-flex rounded-full bg-[#8b1a1a]/5 px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-[#8b1a1a]">
              나의 입시멘토 · 탐구 보고서
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#1a0f08]">탐구·독서 제안 보고서</h1>
            <p className="mt-2 text-sm text-slate-500">화면은 핵심 요약, 인쇄본은 탐구 계획과 자료, 예제, 세특 문장을 최대한 담습니다.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/exploration" className="rounded-xl border border-[#d9c8b3] bg-[#f4ede3] px-4 py-3 font-bold text-slate-700">탐구 화면으로</Link>
            <Link href="/diagnosis" className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 font-bold text-slate-700">입시위치진단으로</Link>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="메일주소 입력" className="min-w-[240px] rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm" />
            <button onClick={handleSendEmail} disabled={isSendingEmail} className="rounded-xl bg-[#0f766e] px-4 py-3 font-bold text-white disabled:opacity-60">{isSendingEmail ? "발송 중" : "메일 보내기"}</button>
            <button onClick={() => window.print()} className="rounded-xl bg-[#8b1a1a] px-4 py-3 font-bold text-white">전체 인쇄</button>
          </div>
        </div>

        {emailStatus ? <div className="mb-4 text-sm font-semibold text-[#8b1a1a] print:hidden">{emailStatus}</div> : null}

        <section className="mb-5 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5">
          <div className="mb-3 inline-flex rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">탐구/독서 제안 개요</div>
          <h2 className="mb-3 text-2xl font-black text-[#1f1720]">보고서 개요</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="학생부 키워드" value={(meta.studentSignals || []).join(", ") || "-"} />
            <SummaryCard label="개인 입력 키워드" value={(meta.manualKeywordList || []).join(", ") || "-"} />
            <SummaryCard label="과목 / 희망학과" value={[meta.subject, meta.careerHint].filter(Boolean).join(" / ") || "-"} />
          </div>
        </section>

        <div className="space-y-5 print:hidden">
          {allResults.length > 0 ? (
            allResults.map((item, index) => (
              <section key={`${item.label}-${index}`} className="rounded-[32px] border border-[#eadfce] bg-[#fffdf8] p-8 shadow-sm">
                <div className="mb-6">
                  <div className="inline-flex rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">{item.subject} · {item.label}</div>
                  <h2 className="mt-3 text-3xl font-black text-[#1f1720]">{item.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-700">{item.direction}</p>
                </div>
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <InfoBlock title="탐구보고서 계획서" items={item.report_plan} />
                  <InfoBlock title="보고서 작성요령" items={item.writing_guide} />
                </div>
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  <InfoBlock title="참조 논문" items={item.papers} />
                  <InfoBlock title="탐구 자료" items={item.data_sources} />
                  <InfoBlock title="추천 도서" items={item.books} />
                </div>
                <div className="mb-6">
                  <InfoBlock title="보고서 각 항목별 예제 (실행 참고용)" items={item.section_examples} />
                </div>
                <div className="rounded-[24px] border border-[#d7c2a5] bg-[#fff8ee] p-6 shadow-sm">
                  <div className="mb-3 text-sm font-black tracking-wide text-[#8b1a1a]">최종 완성 세특 문장</div>
                  <p className="text-lg font-bold leading-8 text-[#1f1720]">{item.setuk_sentence}</p>
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-[24px] border border-dashed border-[#d9c8b3] bg-[#faf6f0] p-6 text-sm text-slate-500">아직 생성된 탐구 결과가 없습니다.</section>
          )}
        </div>

        <PrintableReportShell
          badge="PREMIUM DIAGNOSIS"
          title="탐구·독서 제안 인쇄본"
          subtitle="화면 요약보다 더 많은 탐구 계획, 자료, 예제, 세특 문장을 인쇄본에 모두 담습니다."
          summary={
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryCard label="학생부 키워드" value={(meta.studentSignals || []).join(", ") || "-"} />
              <SummaryCard label="개인 입력 키워드" value={(meta.manualKeywordList || []).join(", ") || "-"} />
              <SummaryCard label="과목 / 희망학과" value={[meta.subject, meta.careerHint].filter(Boolean).join(" / ") || "-"} />
            </div>
          }
        >
          {allResults.length > 0 ? (
            allResults.map((item, index) => (
              <section key={`print-${item.label}-${index}`} className="break-inside-avoid rounded-[32px] border border-[#eadfce] bg-white p-8 shadow-sm mb-6">
                <div className="mb-6">
                  <div className="inline-flex rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">{item.subject} · {item.label}</div>
                  <h2 className="mt-3 text-3xl font-black text-[#1f1720]">{item.title}</h2>
                  <p className="mt-3 text-base leading-7 text-slate-700">{item.direction}</p>
                </div>
                <div className="mb-6 grid gap-4 grid-cols-2">
                  <InfoBlock title="탐구보고서 계획서" items={item.report_plan} />
                  <InfoBlock title="보고서 작성요령" items={item.writing_guide} />
                </div>
                <div className="mb-6 grid gap-4 grid-cols-3">
                  <InfoBlock title="참조 논문" items={item.papers} />
                  <InfoBlock title="탐구 자료" items={item.data_sources} />
                  <InfoBlock title="추천 도서" items={item.books} />
                </div>
                <div className="mb-6">
                  <InfoBlock title="보고서 각 항목별 예제 (실행 참고용)" items={item.section_examples} />
                </div>
                <div className="rounded-[24px] border border-[#d7c2a5] bg-[#fff8ee] p-6 shadow-sm">
                  <div className="mb-3 text-sm font-black tracking-wide text-[#8b1a1a]">최종 완성 세특 문장</div>
                  <p className="text-lg font-bold leading-8 text-[#1f1720]">{item.setuk_sentence}</p>
                </div>
              </section>
            ))
          ) : (
            <section className="rounded-[24px] border border-dashed border-[#d9c8b3] bg-[#faf6f0] p-6 text-sm text-slate-500">아직 생성된 탐구 결과가 없습니다.</section>
          )}
        </PrintableReportShell>
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#eadfce] bg-white p-4">
      <div className="mb-2 text-xs font-bold tracking-[0.16em] text-slate-400">{label}</div>
      <div className="text-base font-black text-[#1f1720]">{value}</div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[20px] border border-[#efe6dc] bg-[#fffdf8] p-5 shadow-sm">
      <div className="mb-3 text-sm font-black text-[#1f1720]">{title}</div>
      <ul className="space-y-3 text-sm leading-6 text-slate-700">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9c8b3]"></span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-slate-400">표시할 내용이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
