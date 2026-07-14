/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, ChartColumnBig, FileText, MessageCircleMore, Target } from "lucide-react";
import AdmissionOfficerEvaluation from "../../../components/admission/AdmissionOfficerEvaluation";
import type { UserInfo } from "@/lib/user-info";

type NormalizedSubject = {
  subject: string;
  unit?: number;
  grade?: number | string;
  year?: number;
  semester?: string | number;
  index: number;
};

function getGradeBucket(grade: number, gradingSystem?: string) {
  if (gradingSystem === "5-level") {
    if (grade <= 2) return "1-2";
    if (grade === 3) return "3";
    if (grade === 4) return "4";
    return "5";
  }

  if (grade <= 2) return "1-2";
  if (grade === 3) return "3";
  if (grade <= 5) return "4-5";
  if (grade <= 7) return "6-7";
  return "8-9";
}

function groupSubjects(subjects: NormalizedSubject[]) {
  const map = new Map<string, { subject: string; units: number; gradeSum: number; count: number }>();
  for (const item of subjects) {
    const current = map.get(item.subject) ?? { subject: item.subject, units: 0, gradeSum: 0, count: 0 };
    current.units += Number(item.unit || 0);
    current.gradeSum += Number(item.grade || 0);
    current.count += 1;
    map.set(item.subject, current);
  }

  return Array.from(map.values())
    .map((item) => ({
      subject: item.subject,
      units: item.units,
      avgGrade: Number((item.gradeSum / Math.max(item.count, 1)).toFixed(2)),
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);
}

export default function StudentAnalysisPage() {
  const [studentInfo, setStudentInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("suprema_user_info");
      if (saved) setStudentInfo(JSON.parse(saved));
    } catch {
      setStudentInfo(null);
    }
  }, []);

  const subjects = (studentInfo?.parsedSubjects ?? []).map((subject, index) => ({
    ...subject,
    index: index + 1,
  })) as NormalizedSubject[];

  const gradeData = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const item of subjects) {
      const bucket = getGradeBucket(Number(item.grade), studentInfo?.gradingSystem);
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [studentInfo?.gradingSystem, subjects]);

  const subjectData = useMemo(() => groupSubjects(subjects), [subjects]);

  const timelineData = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const item of subjects) {
      const name = item.year ? `${item.year}학년` : `항목 ${item.index}`;
      const current = map.get(name) ?? { name, total: 0, count: 0 };
      current.total += Number(item.grade || 0);
      current.count += 1;
      map.set(name, current);
    }
    return Array.from(map.values()).map((item) => ({
      name: item.name,
      average: Number((item.total / Math.max(item.count, 1)).toFixed(2)),
    }));
  }, [subjects]);

  const averageGrade = useMemo(() => {
    if (subjects.length === 0) return null;
    const sum = subjects.reduce((acc, item) => acc + Number(item.grade || 0), 0);
    return Number((sum / subjects.length).toFixed(2));
  }, [subjects]);

  const topKeywords = ((studentInfo?.studentAnalysis?.keyKeywords ?? []) as string[]).slice(0, 6);
  const subjectCount = subjects.length;
  const strongestSubject = subjectData[0]?.subject ?? "미확인";
  const weakestGrade = subjects.length > 0 ? Math.max(...subjects.map((item) => Number(item.grade || 0))) : null;

  return (
    <main className="min-h-screen bg-[#f8f5f1] px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-[#e7ddd0] bg-white p-6 shadow-[0_24px_70px_rgba(44,26,10,0.08)] md:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#ece0d1] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[#8b1a1a]/5 px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-[#8b1a1a]">
              STUDENT RECORD ANALYSIS
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[#1a0f08] md:text-4xl">학생부 3면 분석 화면</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              1. 학생부 원본 · 2. 요약/비교 분석 · 3. 입학사정관 평가를 한 화면에서 분리해 보여줍니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/diagnosis/step1" className="rounded-xl border border-[#d7c8b8] bg-[#faf6f0] px-4 py-3 text-sm font-bold text-slate-700">
              학생부 다시 입력
            </Link>
            <Link href="/diagnosis/step3" className="rounded-xl bg-[#8b1a1a] px-4 py-3 text-sm font-bold text-white">
              탐구주제 제안으로 이동
            </Link>
          </div>
        </div>

        {!studentInfo ? (
          <div className="rounded-2xl border border-dashed border-[#d7c8b8] bg-[#faf6f0] p-8 text-center">
            <p className="text-base font-bold text-slate-700">저장된 학생부 정보가 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">먼저 사용자 정보 입력과 파일 업로드를 진행해야 합니다.</p>
            <Link href="/diagnosis/step1" className="mt-4 inline-flex rounded-xl bg-[#8b1a1a] px-4 py-3 text-sm font-bold text-white">
              입력 페이지로 이동
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#ece0d1] bg-[#fffaf4] p-6">
              <SectionHeader
                step="01"
                title="학생부 원본"
                description="입력된 학생 정보와 원본 과목 항목을 그대로 확인합니다."
              />

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <SummaryCard label="학생" value={studentInfo.studentName || "-"} />
                <SummaryCard label="학교" value={studentInfo.schoolName || "-"} />
                <SummaryCard label="분석 항목 수" value={String(subjectCount)} />
                <SummaryCard label="주요 과목" value={strongestSubject} />
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-[#ece0d1] bg-white">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#faf6f0] text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">번호</th>
                      <th className="px-4 py-3">과목</th>
                      <th className="px-4 py-3">학년/학기</th>
                      <th className="px-4 py-3">단위</th>
                      <th className="px-4 py-3">등급</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={`${subject.index}-${subject.subject}`} className="border-t border-[#f1e7dc]">
                        <td className="px-4 py-3 font-bold text-slate-500">{subject.index}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{subject.subject}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {subject.year ? `${subject.year}학년` : "미확인"}
                          {subject.semester ? ` · ${subject.semester}학기` : ""}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{subject.unit}</td>
                        <td className="px-4 py-3 font-bold text-[#8b1a1a]">{subject.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-[#ece0d1] bg-white p-6">
              <SectionHeader
                step="02"
                title="요약·비교 분석"
                description="학기/과목/키워드 기반으로 성적 흐름과 핵심 항목을 함께 보여줍니다."
              />

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <SectionCard title="등급 분포" icon={<ChartColumnBig className="h-4 w-4" />}>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b1a1a" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="학년/항목 추세" icon={<Target className="h-4 w-4" />}>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} reversed domain={[1, 9]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="average" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <SectionCard title="과목별 요약" icon={<FileText className="h-4 w-4" />}>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="subject" type="category" width={110} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="units" fill="#8b1a1a" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>

                <SectionCard title="핵심 키워드" icon={<MessageCircleMore className="h-4 w-4" />}>
                  <div className="flex flex-wrap gap-2">
                    {topKeywords.length > 0 ? (
                      topKeywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-sm font-semibold text-[#8b1a1a]">
                          #{keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">분석 키워드가 없습니다.</p>
                    )}
                  </div>

                  <div className="mt-6 grid gap-3">
                    {subjects.map((subject) => (
                      <div key={`${subject.index}-${subject.subject}`} className="rounded-2xl border border-[#ece0d1] bg-[#faf6f0] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {subject.index}. {subject.subject}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {subject.year ? `${subject.year}학년` : "학년 미확인"}
                              {subject.semester ? ` · ${subject.semester}학기` : ""}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">{subject.unit}단위</span>
                            <span className="rounded-full bg-[#8b1a1a] px-3 py-1 text-xs font-bold text-white">{subject.grade}등급</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </section>

            <AdmissionOfficerEvaluation
              averageGrade={averageGrade}
              strongestSubject={strongestSubject}
              weakestGrade={weakestGrade}
              subjectCount={subjectCount}
              topKeywords={topKeywords}
            />
            <div className="mt-6 flex justify-end">
              <Link href="/diagnosis/step3" className="inline-flex items-center gap-2 rounded-xl bg-[#8b1a1a] px-4 py-3 text-sm font-bold text-white">
                탐구주제 추천으로 이어가기<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ece0d1] bg-[#faf6f0] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-xl font-black text-[#1a0f08]">{value}</p>
    </div>
  );
}

function SectionHeader({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-black tracking-[0.2em] text-[#8b1a1a]">{step}</p>
        <h2 className="mt-1 text-2xl font-black text-[#1a0f08]">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm text-slate-500">{description}</p>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#ece0d1] bg-white p-5 shadow-[0_8px_24px_rgba(44,26,10,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-[#8b1a1a]/10 p-2 text-[#8b1a1a]">{icon}</div>
        <h3 className="text-lg font-extrabold text-[#1a0f08]">{title}</h3>
      </div>
      {children}
    </section>
  );
}
