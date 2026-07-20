"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { StudentRecordStructured } from "@/lib/student-record";
import type { StudentRecordReportData as SharedStudentRecordReportData } from "@/lib/report-data";
import {
  buildCompetencyScores,
  buildCoreSubjectChecks,
  buildTermSummary,
  buildTrendData,
  buildSubjectGroupRadarData,
  buildDistributionData
} from "@/lib/student-record-analytics";
import { buildStudentRecordMappingRows } from "@/lib/student-record-mapping";
import PrintableReportShell from "../PrintableReportShell";
import GradeTrendChart from "./charts/GradeTrendChart";
import SubjectRadarChart from "./charts/SubjectRadarChart";
import GradeDistributionChart from "./charts/GradeDistributionChart";
import { buildStudentAnalysisReportSummary } from "@/lib/student-analysis-report";

export interface StudentRecordReportData {
  studentName: string;
  schoolName: string;
  grade: string;
  email?: string;
  supportTrack?: string;
  careerHint?: string;
  averageGrade?: number;
  averageGradeRaw?: number;
  parsedSubjects: Array<{
    subject: string;
    unit?: number;
    grade?: number;
    year?: number;
    semester?: number;
    rawScore?: number;
    scoreAverage?: number;
    achievement?: string;
    studentCount?: number;
  }>;
  studentRecord?: SharedStudentRecordReportData["studentRecord"] | StudentRecordStructured;
  studentAnalysis?: {
    keyKeywords?: string[];
    academicCapacity?: string;
    seTeukAnalysis?: string;
    comprehensiveOpinion?: string;
    majorSuitability?: string;
  };
}

const sectionStyle = "rounded-[28px] border border-[#eadfce] bg-[#fffaf4] p-6";
const serviceName = "나의 입시멘토 · 탐구·세특·입시위치진단";
const stageFacts = {
  1: [
    "학생명, 학교, 학년, 평균 등급을 먼저 확인합니다.",
    "과목별 원점수, 평균, 성취도, 수강자 수를 표로 보여줍니다.",
    "원문 항목이 화면의 어느 블록으로 연결되는지 같이 표시합니다.",
  ],
  2: [
    "학기별 평균 등급과 강점 과목을 보여줍니다.",
    "학기 추이, 교과군 레이더, 원점수-평균 편차를 함께 확인합니다.",
    "핵심 키워드, 교과 분석, 세특 분석, 종합 의견을 묶어 보여줍니다.",
  ],
  3: [
    "학생부 전체 흐름을 바탕으로 학업역량, 전공적합성, 종합 의견을 정리합니다.",
    "강점 정리, 보완 포인트, 면접 포인트를 한 번에 확인합니다.",
    "추가 주제를 메일이나 인쇄로 바로 보낼 수 있습니다.",
  ],
} as const;

export default function StudentRecordReport({
  data,
  onPrint,
  onSendEmail,
  isSendingEmail = false,
}: {
  data: StudentRecordReportData;
  onPrint?: () => void;
  onSendEmail?: (email: string) => Promise<{ success: boolean; message: string } | void>;
  isSendingEmail?: boolean;
}) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(data.email || "");
  const [emailStatus, setEmailStatus] = useState("");

  const keywords = data.studentAnalysis?.keyKeywords || [];
  const structured = data.studentRecord;

  const subjectSummary = useMemo(() => {
    if (data.parsedSubjects.length === 0) {
      return {
        bestSubject: "-",
        bestGrade: "-",
        average: typeof data.averageGrade === "number" ? data.averageGrade.toFixed(2) : "-",
      };
    }

    const sorted = [...data.parsedSubjects].sort((a, b) => Number(a.grade ?? 99) - Number(b.grade ?? 99));
    const best = sorted[0];

    return {
      bestSubject: best?.subject || "-",
      bestGrade: typeof best?.grade === "number" ? `${best.grade}등급` : "-",
      average: typeof data.averageGrade === "number" ? data.averageGrade.toFixed(2) : "-",
    };
  }, [data.averageGrade, data.parsedSubjects]);

  const mappingRows = useMemo(
    () =>
      buildStudentRecordMappingRows({
        structured,
        studentName: data.studentName,
        schoolName: data.schoolName,
        grade: data.grade,
        parsedSubjectCount: data.parsedSubjects.length,
      }),
    [data.grade, data.parsedSubjects.length, data.schoolName, data.studentName, structured],
  );

  const termSummary = useMemo(() => buildTermSummary(data.parsedSubjects), [data.parsedSubjects]);
  const coreChecks = useMemo(
    () => buildCoreSubjectChecks(data.parsedSubjects, data.supportTrack, data.careerHint),
    [data.careerHint, data.parsedSubjects, data.supportTrack],
  );
  const competencyScores = useMemo(
    () => buildCompetencyScores(data.parsedSubjects, data.studentAnalysis),
    [data.parsedSubjects, data.studentAnalysis],
  );
  const trendData = useMemo(() => buildTrendData(data.parsedSubjects), [data.parsedSubjects]);
  const radarData = useMemo(() => buildSubjectGroupRadarData(data.parsedSubjects), [data.parsedSubjects]);
  const distributionData = useMemo(() => buildDistributionData(data.parsedSubjects), [data.parsedSubjects]);
  const reportSummary = useMemo(
    () =>
      buildStudentAnalysisReportSummary({
        studentName: data.studentName,
        supportTrack: data.supportTrack,
        careerHint: data.careerHint,
        hopeDepartment: data.supportTrack,
        parsedSubjects: data.parsedSubjects.map((subject) => ({
          subject: subject.subject,
          unit: subject.unit ?? 0,
          grade: subject.grade ?? 0,
        })),
        studentAnalysis: data.studentAnalysis,
      }),
    [data.careerHint, data.parsedSubjects, data.studentAnalysis, data.studentName, data.supportTrack],
  );

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

    if (!onSendEmail) {
      setEmailStatus("메일 발송 기능이 연결되지 않았습니다.");
      return;
    }

    setEmailStatus("");
    const result = await onSendEmail(trimmed);
    if (result?.message) {
      setEmailStatus(result.message);
    }
  };

  return (
    <div className="mx-auto max-w-[1120px] rounded-[32px] border border-[#eadfce] bg-[#fffdf8] p-7 shadow-[0_24px_70px_rgba(44,26,10,0.06)]">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:hidden">
        <div>
          <div className="mb-3 text-sm font-black tracking-[0.06em] text-[#1a0f08]">{serviceName}</div>
          <p className="inline-flex rounded-full bg-[#8b1a1a]/10 px-4 py-2 text-xs font-black tracking-[0.18em] text-[#8b1a1a]">
            02 · 학생부 분석
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-[#1f1720]">학생부 분석 결과</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            학생부 원본, 요약·비교 분석, 입학사정관 평가를 3단 구조로 정리합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="메일주소 입력"
            className="min-w-[240px] rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm text-slate-700"
          />
          {onSendEmail ? (
            <button
              onClick={handleSendEmail}
              className="rounded-xl border border-[#0f766e] bg-[#0f766e] px-4 py-3 font-bold text-white disabled:opacity-60"
              disabled={isSendingEmail}
            >
              {isSendingEmail ? "메일 발송 중" : "메일 보내기"}
            </button>
          ) : null}
          <button onClick={onPrint} className="rounded-xl border border-[#d9c8b3] bg-[#f4ede3] px-4 py-3 font-bold text-slate-700">
            PDF / 인쇄
          </button>
        </div>
      </div>

      {emailStatus ? <div className="mb-4 text-sm font-semibold text-[#8b1a1a] print:hidden">{emailStatus}</div> : null}

      <section className={`${sectionStyle} mb-5`}>
        <div className="grid gap-4 md:grid-cols-5">
          <SummaryCard label="학생명" value={data.studentName || "-"} />
          <SummaryCard label="학교" value={data.schoolName || "-"} />
          <SummaryCard label="학년" value={data.grade || "-"} />
          <SummaryCard label="평균등급" value={subjectSummary.average} />
          <SummaryCard label="핵심 키워드" value={keywords.slice(0, 2).join(" / ") || "-"} />
        </div>
      </section>

      <div className="mb-5 flex flex-wrap gap-3 print:hidden">
        <StepButton active={activeStep === 1} onClick={() => setActiveStep(1)} label="1단계 · 학생부 원본" />
        <StepButton active={activeStep === 2} onClick={() => setActiveStep(2)} label="2단계 · 요약·비교 분석" />
        <StepButton active={activeStep === 3} onClick={() => setActiveStep(3)} label="3단계 · 입학사정관 평가" />
      </div>

      {activeStep === 1 ? (
      <section className={`${sectionStyle} mb-5`}>
        <div className="mb-5 rounded-[22px] border border-[#efe6dc] bg-white p-5">
          <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">1단계 핵심 결과</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {stageFacts[1].map((item) => (
              <div key={item} className="rounded-[18px] bg-[#faf6f0] px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>
        <SectionHeader
          badge="1단계 · 학생부 원본"
          title="원문 → 화면 매핑"
          description="원문 항목이 어느 화면 블록으로 연결되는지 먼저 보여줍니다."
        />

          <div className="mb-6 overflow-x-auto rounded-[20px] border border-[#efe6dc] bg-white">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#efe6dc] bg-[#faf6f0] text-left text-slate-500">
                  <th className="px-4 py-3">학생부 원문 항목</th>
                  <th className="px-4 py-3">화면 블록</th>
                  <th className="px-4 py-3">현재 추출값</th>
                  <th className="px-4 py-3">보고서 위치</th>
                </tr>
              </thead>
              <tbody>
                {mappingRows.map((row) => (
                  <tr key={row.source} className="border-b border-[#f4ede3] align-top">
                    <td className="px-4 py-4 font-bold text-slate-800">{row.source}</td>
                    <td className="px-4 py-4 text-slate-600">{row.target}</td>
                    <td className="px-4 py-4 text-slate-700">{row.value}</td>
                    <td className="px-4 py-4 text-slate-600">{row.reportTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <RecordBlock
              title="학생 정보"
              items={structured?.schoolInfo?.items ?? []}
              rawText={structured?.schoolInfo?.items?.join("\n") ?? ""}
              compact
            />
            <RecordBlock
              title="교육과정 이수"
              items={structured?.curriculum?.items ?? []}
              rawText={structured?.curriculum?.items?.join("\n") ?? ""}
              compact
            />
          </div>

          <div className="mt-4 rounded-[20px] border border-[#efe6dc] bg-white p-5">
            <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">교과학습발달상황</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#efe6dc] bg-[#faf6f0] text-left text-slate-500">
                    <th className="px-3 py-3">과목</th>
                    <th className="px-3 py-3">학년 / 학기</th>
                    <th className="px-3 py-3">단위</th>
                    <th className="px-3 py-3">원점수</th>
                    <th className="px-3 py-3">평균</th>
                    <th className="px-3 py-3">성취도</th>
                    <th className="px-3 py-3">수강자</th>
                    <th className="px-3 py-3">등급</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parsedSubjects.length > 0 ? (
                    data.parsedSubjects.slice(0, 12).map((subject, index) => (
                      <tr key={`${subject.subject}-${index}`} className="border-b border-[#f4ede3]">
                        <td className="px-3 py-3 font-semibold text-slate-700">{subject.subject}</td>
                        <td className="px-3 py-3 text-slate-600">
                          {subject.year ? `${subject.year}학년` : "-"}
                          {subject.semester ? ` · ${subject.semester}학기` : ""}
                        </td>
                        <td className="px-3 py-3 text-slate-600">{subject.unit ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-600">{subject.rawScore ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-600">{subject.scoreAverage ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-600">{subject.achievement ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-600">{subject.studentCount ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-700">{subject.grade ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-slate-400">추출된 과목 데이터가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {activeStep === 2 ? (
        <section className={`${sectionStyle} mb-5`}>
          <div className="mb-5 rounded-[22px] border border-[#efe6dc] bg-white p-5">
            <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">2단계 핵심 결과</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {stageFacts[2].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#faf6f0] px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <SectionHeader
            badge="2단계 · 요약·비교 분석"
            title="핵심 지표 요약"
            description="학기별 요약, 핵심과목 체크, 키워드, 역량 평가를 한 화면에서 연결합니다."
          />

          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <SummaryCard label="강점 과목" value={subjectSummary.bestSubject} />
            <SummaryCard label="최고 등급" value={subjectSummary.bestGrade} />
            <SummaryCard label="평균 등급" value={subjectSummary.average} />
          </div>

          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-extrabold text-[#1f1720]">학기별 성적 추이</h3>
              <GradeTrendChart data={trendData} />
            </div>
            <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-extrabold text-[#1f1720]">교과군별 역량 (레이더)</h3>
              <SubjectRadarChart data={radarData} />
            </div>
            <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-extrabold text-[#1f1720]">원점수 - 평균 편차 (상위 10과목)</h3>
              <GradeDistributionChart data={distributionData} />
            </div>
          </div>

          <div className="mb-4 grid gap-4 md:grid-cols-3">
            {competencyScores.map((item) => (
              <ScoreCard key={item.label} label={item.label} score={item.score} level={item.level} />
            ))}
          </div>

          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <DataTableCard
              title="학기별 요약 표"
              headers={["학기", "과목 수", "평균 등급", "강점 과목"]}
              rows={termSummary.length > 0
                ? termSummary.map((row) => [row.label, `${row.subjectCount}`, row.averageGrade?.toFixed(2) || "-", row.bestSubject])
                : [["-", "-", "-", "-"]]}
            />
            <DataTableCard
              title="핵심과목 이수 체크"
              headers={["영역", "필수 이수", "선택 이수", "판정"]}
              rows={coreChecks.map((row) => [
                row.group,
                row.completedRequired.length > 0 ? row.completedRequired.join(", ") : row.missingRequired.length > 0 ? `부족: ${row.missingRequired.join(", ")}` : "-",
                row.completedOptional.length > 0 ? row.completedOptional.join(", ") : "-",
                row.status,
              ])}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnalysisBox title="핵심 키워드">
              <div className="flex flex-wrap gap-2">
                {keywords.length > 0 ? (
                  keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-bold text-[#8b1a1a]">
                      #{keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">추출된 키워드가 없습니다.</span>
                )}
              </div>
            </AnalysisBox>
            <AnalysisBox title="교과 분석">
              <p>{data.studentAnalysis?.academicCapacity || "교과학습발달상황 분석값이 아직 연결되지 않았습니다."}</p>
            </AnalysisBox>
            <AnalysisBox title="세특 분석">
              <p>{data.studentAnalysis?.seTeukAnalysis || "세부능력 및 특기사항 분석값이 아직 연결되지 않았습니다."}</p>
            </AnalysisBox>
            <AnalysisBox title="종합 요약">
              <p>{data.studentAnalysis?.comprehensiveOpinion || "종합 의견 분석값이 아직 연결되지 않았습니다."}</p>
            </AnalysisBox>
          </div>
        </section>
      ) : null}

      {activeStep === 3 ? (
        <section className={sectionStyle}>
          <div className="mb-5 rounded-[22px] border border-[#efe6dc] bg-white p-5">
            <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">3단계 핵심 결과</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {stageFacts[3].map((item) => (
                <div key={item} className="rounded-[18px] bg-[#faf6f0] px-4 py-3 text-sm font-semibold leading-6 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <SectionHeader
            badge="3단계 · 입학사정관 평가"
            title="판단과 다음 행동"
            description="학생부 전체 흐름을 바탕으로 학업역량, 전공적합성, 종합 의견을 한 번에 정리합니다."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <AnalysisBox title="학업역량">
              <p>{data.studentAnalysis?.academicCapacity || "학생부 기반 학업역량 분석이 아직 연결되지 않았습니다."}</p>
            </AnalysisBox>
            <AnalysisBox title="전공적합성">
              <p>{data.studentAnalysis?.majorSuitability || "전공 적합성 판단 문구가 아직 연결되지 않았습니다."}</p>
            </AnalysisBox>
            <AnalysisBox title="종합 의견">
              <p>{reportSummary.overallSummary}</p>
            </AnalysisBox>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SummaryCard label="추천 판단" value={keywords[0] ? `${keywords[0]} 중심 강점 유지` : "학생부 강점 유지"} />
            <SummaryCard label="보완 포인트" value={data.parsedSubjects.length > 0 ? "과목 간 연속성과 탐구 연결 강화" : "교과 데이터 추출 확인 필요"} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <AnalysisBox title="강점 정리">
              <ul className="list-disc space-y-2 pl-5">
                {reportSummary.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AnalysisBox>
            <AnalysisBox title="보완 포인트">
              <ul className="list-disc space-y-2 pl-5">
                {reportSummary.cautions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AnalysisBox>
            <AnalysisBox title="면접 포인트">
              <ul className="list-disc space-y-2 pl-5">
                {reportSummary.interviewPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </AnalysisBox>
          </div>
        </section>
      ) : null}

      <div className="mt-6 flex justify-between print:hidden">
        <button onClick={() => setActiveStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))} className="rounded-xl border border-[#d9c8b3] bg-[#f4ede3] px-4 py-3 font-bold text-slate-700">
          이전
        </button>
        <button onClick={() => setActiveStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev))} className="rounded-xl border border-[#8b1a1a] bg-[#8b1a1a] px-4 py-3 font-bold text-white">
          다음
        </button>
      </div>

      <PrintableReportShell
        badge="PRINT REPORT"
        title="학생부 분석 인쇄본"
        subtitle="화면 요약보다 더 많은 원문 항목과 분석 의견을 인쇄본에 모두 담습니다."
        summary={
          <div className="grid gap-3 md:grid-cols-5">
            <SummaryCard label="학생명" value={data.studentName || "-"} />
            <SummaryCard label="학교" value={data.schoolName || "-"} />
            <SummaryCard label="학년" value={data.grade || "-"} />
            <SummaryCard label="평균등급" value={subjectSummary.average} />
            <SummaryCard label="핵심 키워드" value={keywords.slice(0, 3).join(" / ") || "-"} />
          </div>
        }
      >
        <div className="rounded-[24px] border border-[#eadfce] bg-white p-5">
          <h2 className="mb-3 text-xl font-black text-[#1f1720]">원문 항목 매핑</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#efe6dc] bg-[#faf6f0] text-left text-slate-500">
                  <th className="px-4 py-3">학생부 원문 항목</th>
                  <th className="px-4 py-3">화면 블록</th>
                  <th className="px-4 py-3">추출값</th>
                  <th className="px-4 py-3">보고서 위치</th>
                </tr>
              </thead>
              <tbody>
                {mappingRows.map((row) => (
                  <tr key={`print-${row.source}`} className="border-b border-[#f4ede3] align-top">
                    <td className="px-4 py-4 font-bold text-slate-800">{row.source}</td>
                    <td className="px-4 py-4 text-slate-600">{row.target}</td>
                    <td className="px-4 py-4 text-slate-700">{row.value}</td>
                    <td className="px-4 py-4 text-slate-600">{row.reportTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#eadfce] bg-white p-5">
          <h2 className="mb-3 text-xl font-black text-[#1f1720]">교과학습발달상황 전체</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#efe6dc] bg-[#faf6f0] text-left text-slate-500">
                  <th className="px-3 py-3">과목</th>
                  <th className="px-3 py-3">학년 / 학기</th>
                  <th className="px-3 py-3">단위</th>
                  <th className="px-3 py-3">원점수</th>
                  <th className="px-3 py-3">평균</th>
                  <th className="px-3 py-3">성취도</th>
                  <th className="px-3 py-3">수강자</th>
                  <th className="px-3 py-3">등급</th>
                </tr>
              </thead>
              <tbody>
                {data.parsedSubjects.length > 0 ? (
                  data.parsedSubjects.map((subject, index) => (
                    <tr key={`print-subject-${subject.subject}-${index}`} className="border-b border-[#f4ede3]">
                      <td className="px-3 py-3 font-semibold text-slate-700">{subject.subject}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {subject.year ? `${subject.year}학년` : "-"}
                        {subject.semester ? ` · ${subject.semester}학기` : ""}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{subject.unit ?? "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{subject.rawScore ?? "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{subject.scoreAverage ?? "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{subject.achievement ?? "-"}</td>
                      <td className="px-3 py-3 text-slate-600">{subject.studentCount ?? "-"}</td>
                      <td className="px-3 py-3 text-slate-700">{subject.grade ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-3 py-4 text-slate-400">추출된 과목 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#eadfce] bg-white p-5">
          <h2 className="mb-3 text-xl font-black text-[#1f1720]">입학사정관 종합 의견</h2>
          <PrintParagraph title="학업역량" value={data.studentAnalysis?.academicCapacity || "학생부 기반 학업역량 분석이 아직 연결되지 않았습니다."} />
          <PrintParagraph title="세특 분석" value={data.studentAnalysis?.seTeukAnalysis || "세특 분석이 아직 연결되지 않았습니다."} />
          <PrintParagraph title="전공적합성" value={data.studentAnalysis?.majorSuitability || "전공 적합성 판단 문구가 아직 연결되지 않았습니다."} />
          <PrintParagraph title="종합 의견" value={reportSummary.overallSummary} />
          <PrintParagraph title="강점 정리" value={reportSummary.strengths.join(" / ") || "강점 문구가 아직 연결되지 않았습니다."} />
          <PrintParagraph title="보완 포인트" value={reportSummary.cautions.join(" / ") || "보완 포인트가 아직 연결되지 않았습니다."} />
          <PrintParagraph title="면접 포인트" value={reportSummary.interviewPoints.join(" / ")} />
        </div>

        <div className="rounded-[24px] border border-[#eadfce] bg-white p-5">
          <h2 className="mb-3 text-xl font-black text-[#1f1720]">요약·비교 분석 부록</h2>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            {competencyScores.map((item) => (
              <ScoreCard key={`print-${item.label}`} label={item.label} score={item.score} level={item.level} />
            ))}
          </div>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
              <h3 className="mb-3 text-sm font-extrabold text-[#1f1720]">학기별 성적 추이</h3>
              <GradeTrendChart data={trendData} />
            </div>
            <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
              <h3 className="mb-3 text-sm font-extrabold text-[#1f1720]">교과군별 역량 (레이더)</h3>
              <SubjectRadarChart data={radarData} />
            </div>
            <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
              <h3 className="mb-3 text-sm font-extrabold text-[#1f1720]">원점수 - 평균 편차</h3>
              <GradeDistributionChart data={distributionData} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <DataTableCard
              title="학기별 요약 표"
              headers={["학기", "과목 수", "평균 등급", "강점 과목"]}
              rows={termSummary.length > 0
                ? termSummary.map((row) => [row.label, `${row.subjectCount}`, row.averageGrade?.toFixed(2) || "-", row.bestSubject])
                : [["-", "-", "-", "-"]]}
            />
            <DataTableCard
              title="핵심과목 이수 체크"
              headers={["영역", "필수 이수", "선택 이수", "판정"]}
              rows={coreChecks.map((row) => [
                row.group,
                row.completedRequired.length > 0 ? row.completedRequired.join(", ") : row.missingRequired.length > 0 ? `부족: ${row.missingRequired.join(", ")}` : "-",
                row.completedOptional.length > 0 ? row.completedOptional.join(", ") : "-",
                row.status,
              ])}
            />
          </div>
        </div>
      </PrintableReportShell>
    </div>
  );
}

function SectionHeader({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <>
      <div className="mb-3 inline-flex rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">{badge}</div>
      <h2 className="mb-2 text-2xl font-black text-[#1f1720]">{title}</h2>
      <p className="mb-5 text-sm leading-6 text-slate-500">{description}</p>
    </>
  );
}

function StepButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-bold ${active ? "bg-[#8b1a1a] text-white" : "border border-[#d9c8b3] bg-white text-slate-700"}`}>
      {label}
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#eadfce] bg-white p-4">
      <div className="mb-2 text-xs font-bold tracking-[0.16em] text-slate-400">{label}</div>
      <div className="text-lg font-black text-[#1f1720]">{value}</div>
    </div>
  );
}

function ScoreCard({ label, score, level }: { label: string; score: number; level: string }) {
  return (
    <div className="rounded-[20px] border border-[#eadfce] bg-white p-4">
      <div className="mb-2 text-xs font-bold tracking-[0.16em] text-slate-400">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="text-3xl font-black text-[#1f1720]">{score}</div>
        <div className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-sm font-black text-[#8b1a1a]">{level}</div>
      </div>
    </div>
  );
}

function DataTableCard({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
      <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#efe6dc] bg-[#faf6f0] text-left text-slate-500">
              {headers.map((header) => (
                <th key={header} className="px-3 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`} className="border-b border-[#f4ede3] align-top">
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`} className="px-3 py-3 text-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordBlock({ title, items, rawText, compact = false }: { title: string; items?: string[]; rawText?: string; compact?: boolean }) {
  const visibleItems = items?.filter(Boolean) || [];
  const content = compact ? visibleItems.slice(0, 3) : visibleItems;
  return (
    <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
      <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">{title}</h3>
      {content.length > 0 ? (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {content.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <pre className="whitespace-pre-wrap rounded-xl bg-[#faf6f0] p-4 text-sm leading-6 text-slate-500">{rawText || "추출된 원문이 없습니다."}</pre>
      )}
    </div>
  );
}

function AnalysisBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#efe6dc] bg-white p-5">
      <h3 className="mb-3 text-lg font-extrabold text-[#1f1720]">{title}</h3>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
}

function PrintParagraph({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 text-sm font-black text-[#1f1720]">{title}</div>
      <p className="text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
