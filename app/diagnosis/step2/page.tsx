"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import FlowShell from "@/app/components/FlowShell";
import AppFooter from "@/app/components/AppFooter";
import { toStudentRecordReportData } from "@/lib/report-data";
import { buildStudentRecordMappingRows } from "@/lib/student-record-mapping";
import type { UserInfo } from "@/lib/user-info";
import { diagnosisSteps } from "../steps";

type SubjectRow = {
  subject: string;
  grade: number;
  term: string;
  rawScore: number;
  scoreAverage: number;
};

export default function DiagnosisStep2Page() {
  const [info] = useState<Partial<UserInfo> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("suprema_user_info");
      return raw ? (JSON.parse(raw) as Partial<UserInfo>) : null;
    } catch {
      return null;
    }
  });
  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState(() => info?.email || "mary@example.com");
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const reportData = useMemo(() => toStudentRecordReportData(info), [info]);
  const keywords = reportData.studentAnalysis?.keyKeywords || [];

  const subjects = useMemo<SubjectRow[]>(() => {
    return reportData.parsedSubjects.map((item, index) => ({
      subject: item.subject,
      grade: Number(item.grade ?? 3),
      term: `${item.year || Math.floor(index / 2) + 1}-${item.semester || (index % 2) + 1}`,
      rawScore: Number(item.rawScore ?? 0),
      scoreAverage: Number(item.scoreAverage ?? 0),
    }));
  }, [reportData.parsedSubjects]);

  const trendData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const subject of subjects) {
      const row = map.get(subject.term) || { total: 0, count: 0 };
      row.total += subject.grade;
      row.count += 1;
      map.set(subject.term, row);
    }
    return [...map.entries()].map(([term, row]) => ({
      term,
      student: Number((row.total / row.count).toFixed(2)),
      peer: Number((row.total / row.count + 1.1).toFixed(2)),
    }));
  }, [subjects]);

  const radarData = useMemo(() => {
    const averageGrade = subjects.length
      ? subjects.reduce((sum, item) => sum + item.grade, 0) / subjects.length
      : 0;
    const academic = averageGrade ? Math.max(1, Math.min(4, 5 - averageGrade)) : 0;
    const keywordScore = Math.min(4, keywords.length + 1);
    return [
      { axis: "학업역량", value: Number(academic.toFixed(1)) },
      { axis: "진로역량", value: reportData.studentAnalysis?.majorSuitability ? 3.4 : keywordScore },
      { axis: "탐구역량", value: reportData.studentAnalysis?.seTeukAnalysis ? 3.6 : keywordScore },
      { axis: "성장가능성", value: reportData.studentAnalysis?.comprehensiveOpinion ? 3.5 : keywordScore },
      { axis: "공동체역량", value: reportData.studentRecord?.behaviorSummary?.items?.length ? 3.2 : keywordScore },
    ];
  }, [keywords.length, reportData.studentAnalysis, reportData.studentRecord, subjects]);

  const distributionData = subjects
    .filter((item) => item.rawScore > 0 && item.scoreAverage > 0)
    .map((item) => ({
      subject: item.subject,
      diff: Number((item.rawScore - item.scoreAverage).toFixed(1)),
    }));

  const mappingRows = useMemo(
    () =>
      buildStudentRecordMappingRows({
        structured: reportData.studentRecord,
        studentName: reportData.studentName,
        schoolName: reportData.schoolName,
        grade: reportData.grade,
        parsedSubjectCount: reportData.parsedSubjects.length,
      }),
    [reportData],
  );

  const sourceSections = useMemo(
    () =>
      [
        reportData.studentRecord?.schoolInfo,
        reportData.studentRecord?.curriculum,
        reportData.studentRecord?.grades,
        reportData.studentRecord?.sepec,
        reportData.studentRecord?.creativeActivities,
        reportData.studentRecord?.behaviorSummary,
      ].filter((section): section is NonNullable<typeof section> => Boolean(section)),
    [reportData.studentRecord],
  );

  async function handleSendEmail() {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("메일주소를 입력해 주세요.");
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
          subject: "[나의 입시멘토] 학생부 분석 결과",
          reportData: {
            service: "나의 입시멘토",
            type: "student-record-analysis",
            data: reportData,
            subjects,
            keywords,
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
      title="학생부 분석"
      subtitle="학생부 상세 분석결과를 리포트로 제공합니다."
      currentStep={2}
      steps={diagnosisSteps}
      footer={<AppFooter />}
    >
      <div className="mx-auto max-w-[1040px] overflow-hidden rounded-[28px] border border-[#eadfce] bg-[#eef2f7] text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
        <section className="bg-gradient-to-r from-[#345f7a] to-[#4b4278] p-6 text-white">
          <h2 className="text-2xl font-black">학생부종합전형 분석 대시보드</h2>
          <p className="mt-2 text-sm font-bold opacity-90">
            학생부 원문, 요약·비교 분석, 평가 메모를 한 화면에서 연결해 보여줍니다.
          </p>
          <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-7">
            이 화면은 학생부종합전형 준비를 위해 학생부 원문과 교과 추이, 역량 분석, 입학사정관 관점의 메모를
            한 번에 확인할 수 있도록 구성한 분석 화면입니다.
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/15 px-4 py-2">
              지원자: {reportData.schoolName || "학교 정보 없음"} · {reportData.grade || "학년 정보 없음"} ·{" "}
              {reportData.studentName || "학생명 없음"}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2">체험판(로컬 저장 지원)</span>
          </div>
        </section>

        <section className="grid gap-4 p-4 lg:grid-cols-[260px_1fr_1fr]">
          <div className="col-span-full grid gap-3 md:grid-cols-3">
            <IntroCard no="1" title="학생부 원문" description="원문 확인과 키워드 검색, 모집단위 기준 선택을 진행합니다." />
            <IntroCard no="2" title="요약·비교 분석" description="학기별 추이와 핵심 역량 차이를 중앙 분석 영역에서 확인합니다." />
            <IntroCard no="3" title="비교·평가" description="유사집단 비교, 과목 분포, 평가 메모를 우측에서 확인합니다." />
          </div>

          <div className="col-span-full grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3">
              <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">요약비교분석</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                학생부 원문과 요약 비교를 한 화면에서 보고, 핵심 문장과 평가 포인트를 함께 확인합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white px-4 py-3">
              <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">비교평가</div>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                그래프와 표를 함께 사용해 학기별 추이, 과목별 편차, 학생부 반영 기준을 비교합니다.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">1분면 · 학생부 원문</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                키워드 검색, 모집단위 기준 선택, 학생부 매핑 정보를 확인합니다.
              </p>
            </div>

            <Panel title="키워드 검색" action="세특·창체·행발 하이라이트">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="예: 미분 / 모델링 / 오차 / 협업 / 전공"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold"
              />
              <p className="mt-3 text-xs font-semibold text-slate-500">
                입력하면 좌측 원문과 세특 목록에서 일치 문구를 강조합니다.
              </p>
            </Panel>

            <Panel title="모집단위(기준 전환)" action="핵심과목·평가축 자동">
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
                <option>{reportData.careerHint || "희망 진로/학과 정보 없음"}</option>
              </select>
              <button className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-sm">
                불러오기
              </button>
            </Panel>

            <Panel title="학생부 매핑">
              <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-700">
                {mappingRows.map((row) => (
                  <li key={row.source}>
                    <span className="font-black text-slate-900">{row.source}</span>
                    <br />
                    <span className="text-slate-500">{row.target}</span>
                    <br />
                    <HighlightText text={highlightKeyword(row.value, keyword)} />
                  </li>
                ))}
              </ul>
            </Panel>

            {sourceSections.length ? (
              sourceSections.map((section) => (
                <Panel key={section.title} title={section.title}>
                  <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-700">
                    {section.items.map((item) => (
                      <li key={item}>
                        · <HighlightText text={highlightKeyword(item, keyword)} />
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))
            ) : (
              <Panel title="학생부 원문">
                <p className="text-sm font-semibold leading-6 text-slate-500">
                  학생부 PDF를 업로드하면 원문 항목이 이 영역에 표시됩니다.
                </p>
              </Panel>
            )}
          </aside>

          <main className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">2분면 · 요약·비교 분석</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                학기별 추이와 역량 구조를 중앙 분석 영역에서 보여줍니다.
              </p>
            </div>

            <ChartPanel title="학기별 등급 추이" badge="성장형">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis domain={[1, 6]} reversed />
                  <Tooltip />
                  <Line type="monotone" dataKey="student" name="학생 평균" stroke="#38a3e8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
              {!trendData.length ? <EmptyChartMessage text="교과 성적 데이터가 없습니다." /> : null}
            </ChartPanel>

            <ChartPanel title="성취도 시각화(육각형·레이더)" badge="A=4, B=3, C=2, D=1">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" />
                  <PolarRadiusAxis domain={[0, 4]} />
                  <Radar dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.22} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <Panel title="핵심 키워드">
              <div className="flex flex-wrap gap-2">
                {keywords.length ? (
                  keywords.map((item) => (
                    <span key={item} className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                      #{item}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    학생부 분석 후 핵심 키워드가 이 영역에 표시됩니다.
                  </span>
                )}
              </div>
            </Panel>
          </main>

          <aside className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">3분면 · 비교·평가</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                유사집단 평균, 과목 분포, 평가 메모를 함께 보여줍니다.
              </p>
            </div>

            <ChartPanel title="선택 과목 조합 평균 추이" badge="조합: 수학 I, 수학 II, 미적분">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis domain={[1, 6]} reversed />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="student" name="학생 평균" stroke="#38a3e8" strokeWidth={3} />
                  <Line type="monotone" dataKey="peer" name="유사집단 평균" stroke="#fb7185" strokeWidth={2} strokeDasharray="6 6" />
                </LineChart>
              </ResponsiveContainer>
              {!trendData.length ? <EmptyChartMessage text="비교 가능한 과목 조합 데이터가 없습니다." /> : null}
            </ChartPanel>

            <ChartPanel title="과목 성취도 분포" badge="A/B/C 비율">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="diff" name="자점수-평균" fill="#7dd3fc" stroke="#38a3e8" />
                </BarChart>
              </ResponsiveContainer>
              {!distributionData.length ? <EmptyChartMessage text="점수와 평균 점수가 추출된 과목이 없습니다." /> : null}
            </ChartPanel>

            <Panel title="입학사정관 평가 메모">
              <p className="text-sm font-semibold leading-7 text-slate-700">
                {reportData.studentAnalysis?.comprehensiveOpinion ||
                  "전공 관련 교과와 학생부 핵심 주제를 더 밀도 있게 연결하면 학생부의 설득력이 높아집니다. 탐구 결과물과 세특 문장을 함께 강화하면 평가 완성도가 더 높아집니다."}
              </p>
            </Panel>
          </aside>
        </section>

        <section className="border-t border-slate-200 bg-white p-4 print:hidden">
          {status ? <div className="mb-3 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a]">{status}</div> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.print()} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white">
                인쇄
              </button>
              <button
                onClick={() => setMailOpen((prev) => !prev)}
                className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]"
              >
                메일 보내기
              </button>
            </div>
            <div className="flex gap-3">
              <Link href="/diagnosis/step1" className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black text-[#3f3f46]">
                이전 단계
              </Link>
              <Link href="/diagnosis/step3" className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white">
                다음 단계로 이동
              </Link>
            </div>
          </div>
          {mailOpen ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="메일주소 입력"
                className="min-w-[260px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              />
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {sending ? "발송 중" : "학생부 분석 전체 발송"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </FlowShell>
  );
}

function highlightKeyword(text: string, keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed || !text.includes(trimmed)) return text;
  return text.replace(trimmed, `[[${trimmed}]]`);
}

function IntroCard({ no, title, description }: { no: string; title: string; description: string }) {
  return (
    <section className="rounded-2xl border border-[#d8cfbf] bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8b1a1a] bg-[#8b1a1a] text-sm font-black text-white">
          {no}
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{description}</p>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-slate-900">{title}</h4>
        {action ? <span className="text-xs font-black text-slate-400">{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

function ChartPanel({ title, badge, children }: { title: string; badge?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-slate-900">{title}</h4>
        {badge ? <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyChartMessage({ text }: { text: string }) {
  return <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">{text}</div>;
}

function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((part) =>
        part.startsWith("[[") && part.endsWith("]]") ? (
          <mark key={part} className="rounded bg-yellow-200 px-1 text-slate-900">
            {part.slice(2, -2)}
          </mark>
        ) : (
          <span key={part}>{part}</span>
        ),
      )}
    </>
  );
}
