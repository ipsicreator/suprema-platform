"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppFooter from "@/app/components/AppFooter";
import FlowShell from "@/app/components/FlowShell";
import StudentRecordReport from "@/app/components/student-record/StudentRecordReport";
import { toStudentRecordReportData } from "@/lib/report-data";
import { buildRiskSignals, buildSubjectComparison } from "@/lib/step2-analysis";
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
  const [sending, setSending] = useState(false);
  const [leftCompare, setLeftCompare] = useState("");
  const [rightCompare, setRightCompare] = useState("");
  const [localMemo, setLocalMemo] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return sessionStorage.getItem("diagnosis_step2_local_memo") || "";
    } catch {
      return "";
    }
  });

  const reportData = useMemo(() => toStudentRecordReportData(info), [info]);

  const subjects = useMemo<SubjectRow[]>(
    () =>
      reportData.parsedSubjects.map((item, index) => ({
        subject: item.subject || "과목 미확인",
        grade: Number(item.grade ?? 0),
        term: `${item.year || Math.floor(index / 2) + 1}-${item.semester || (index % 2) + 1}`,
        rawScore: Number(item.rawScore ?? 0),
        scoreAverage: Number(item.scoreAverage ?? 0),
      })),
    [reportData.parsedSubjects],
  );

  const compareOptions = useMemo(
    () => [...new Set(subjects.map((item) => item.subject).filter(Boolean))],
    [subjects],
  );

  const comparison = useMemo(() => {
    const left = leftCompare || compareOptions[0] || "";
    const right = rightCompare || compareOptions[1] || "";
    if (!left || !right || left === right) return null;
    return buildSubjectComparison(subjects, left, right);
  }, [compareOptions, leftCompare, rightCompare, subjects]);

  const riskSignals = useMemo(
    () => buildRiskSignals(subjects, reportData.studentAnalysis),
    [reportData.studentAnalysis, subjects],
  );

  const distributionPreview = useMemo(
    () =>
      subjects
        .filter((item) => item.rawScore > 0 && item.scoreAverage > 0)
        .map((item) => ({
          subject: item.subject,
          diff: Number((item.rawScore - item.scoreAverage).toFixed(1)),
          rawScore: item.rawScore,
          scoreAverage: item.scoreAverage,
        }))
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 5),
    [subjects],
  );

  async function handleSendEmail(email: string) {
    setSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: "[나의 입시멘토] 학생부 분석 결과",
          reportData,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, message: String(result?.error || "메일 발송에 실패했습니다.") };
      }
      return { success: true, message: String(result?.message || "메일 발송이 완료되었습니다.") };
    } catch {
      return { success: false, message: "메일 발송 중 오류가 발생했습니다." };
    } finally {
      setSending(false);
    }
  }

  function handleMemoChange(value: string) {
    setLocalMemo(value);
    try {
      sessionStorage.setItem("diagnosis_step2_local_memo", value);
    } catch {}
  }

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title="학생부 분석"
      subtitle="학생부 상세 분석 결과를 리포트 형태로 보여줍니다."
      currentStep={2}
      steps={diagnosisSteps}
      footer={<AppFooter />}
    >
      <div className="mx-auto max-w-[1120px] space-y-6">
        <StudentRecordReport data={reportData} onPrint={() => window.print()} onSendEmail={handleSendEmail} isSendingEmail={sending} />

        <section className="rounded-[28px] border border-[#eadfce] bg-[#fffaf4] p-6">
          <div className="mb-4">
            <div className="mb-2 inline-flex rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">
              비교 평가
            </div>
            <h2 className="text-2xl font-black text-[#1f1720]">추가 비교 패널</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              세특 비교 2과목, 비교학생 불러오기, 위험요소 체크를 따로 모아 확인합니다.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
              <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">세특 비교 2과목</h3>
              {compareOptions.length > 1 ? (
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      value={leftCompare || compareOptions[0]}
                      onChange={(event) => setLeftCompare(event.target.value)}
                      className="w-full rounded-xl border border-[#d9c8b3] bg-white px-3 py-3 text-sm font-semibold text-slate-700"
                    >
                      {compareOptions.map((item) => (
                        <option key={`left-${item}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <select
                      value={rightCompare || compareOptions[1]}
                      onChange={(event) => setRightCompare(event.target.value)}
                      className="w-full rounded-xl border border-[#d9c8b3] bg-white px-3 py-3 text-sm font-semibold text-slate-700"
                    >
                      {compareOptions.map((item) => (
                        <option key={`right-${item}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {comparison ? (
                    <div className="space-y-3">
                      <ComparisonBox label="과목 A" item={comparison.left} />
                      <ComparisonBox label="과목 B" item={comparison.right} />
                      <div className="rounded-xl bg-[#faf6f0] px-4 py-3 text-sm font-semibold text-slate-700">
                        {comparison.gradeGapText} / {comparison.scoreGapText}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">비교 가능한 서로 다른 과목 2개가 필요합니다.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500">비교용 과목 데이터가 부족합니다.</p>
              )}
            </section>

            <section className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
              <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">비교학생 불러오기</h3>
              <p className="mb-3 text-sm leading-6 text-slate-500">
                현재는 비교 학생 데이터 대신, 내 원점수와 평균 차이가 큰 과목을 우선 보여줍니다.
              </p>
              <div className="space-y-3">
                {distributionPreview.length > 0 ? (
                  distributionPreview.map((item) => (
                    <div key={`${item.subject}-${item.diff}`} className="rounded-xl bg-[#faf6f0] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-slate-900">{item.subject}</span>
                        <span className="text-sm font-black text-[#8b1a1a]">{item.diff > 0 ? `+${item.diff}` : item.diff}</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-600">
                        원점수 {item.rawScore} / 평균 {item.scoreAverage}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-slate-500">비교할 점수 데이터가 없습니다.</p>
                )}
              </div>
            </section>

            <section className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
              <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">위험요소 체크</h3>
              <div className="space-y-3">
                {riskSignals.length > 0 ? (
                  riskSignals.map((item) => (
                    <div key={item} className="rounded-xl bg-[#faf6f0] px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-semibold text-slate-500">현재 표시할 위험요소가 없습니다.</p>
                )}
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-[20px] border border-[#efe6dc] bg-white p-5">
            <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">입학사정관 메모</h3>
            <p className="mb-4 text-sm leading-7 text-slate-700">
              {reportData.studentAnalysis?.comprehensiveOpinion || "종합 의견 데이터가 아직 연결되지 않았습니다."}
            </p>
            <textarea
              value={localMemo}
              onChange={(event) => handleMemoChange(event.target.value)}
              placeholder="학생부를 보고 필요한 메모를 남기세요."
              className="min-h-[140px] w-full rounded-xl border border-[#d9c8b3] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-slate-700"
            />
          </section>
        </section>

        <div className="flex justify-between gap-3">
          <Link
            href="/diagnosis/step1"
            className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black text-[#3f3f46]"
          >
            이전 단계
          </Link>
          <Link
            href="/diagnosis/step3"
            className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white"
          >
            다음 단계로 이동
          </Link>
        </div>
      </div>
    </FlowShell>
  );
}

function ComparisonBox({
  label,
  item,
}: {
  label: string;
  item: { subject: string; grade: number; term: string; rawScore: number; scoreAverage: number };
}) {
  return (
    <div className="rounded-xl border border-[#efe6dc] bg-[#fffdf8] px-4 py-3">
      <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">{label}</div>
      <div className="mt-2 text-base font-black text-slate-900">{item.subject}</div>
      <div className="mt-2 space-y-1 text-sm font-semibold text-slate-600">
        <div>학기: {item.term}</div>
        <div>등급: {item.grade}</div>
        <div>원점수: {item.rawScore || "-"}</div>
        <div>평균: {item.scoreAverage || "-"}</div>
      </div>
    </div>
  );
}
