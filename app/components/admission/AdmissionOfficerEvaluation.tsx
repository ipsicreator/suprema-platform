type AdmissionOfficerEvaluationProps = {
  averageGrade: number | null;
  strongestSubject: string;
  weakestGrade: number | null;
  subjectCount: number;
  topKeywords?: string[];
  compact?: boolean;
};

function getAssessmentLabel(avgGrade: number | null) {
  if (avgGrade === null) return "데이터 부족";
  if (avgGrade <= 2) return "상위권";
  if (avgGrade <= 4) return "경쟁권";
  return "보완 필요";
}

export default function AdmissionOfficerEvaluation({
  averageGrade,
  strongestSubject,
  weakestGrade,
  subjectCount,
  topKeywords = [],
  compact = false,
}: AdmissionOfficerEvaluationProps) {
  const label = getAssessmentLabel(averageGrade);

  const summary =
    averageGrade === null
      ? "학생부 데이터가 부족해 세부 평가는 어렵습니다."
      : averageGrade <= 2
        ? "과목 간 성취도가 높고, 핵심 과목의 안정성이 확인됩니다. 탐구 심화와 전형 적합성을 함께 강조하는 전략이 유리합니다."
        : averageGrade <= 4
          ? "기본 성취는 확보되어 있으나, 핵심 과목과 탐구의 연결 강도를 더 분명히 보여줄 필요가 있습니다."
          : "교과 성취를 우선 보완하면서, 탐구 주제와 활동의 일관성을 강화하는 전략이 필요합니다.";

  return (
    <section className="rounded-3xl border border-[#ece0d1] bg-[#fffaf4] p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black tracking-[0.2em] text-[#8b1a1a]">03</p>
          <h2 className="mt-1 text-2xl font-black text-[#1a0f08]">입학사정관 평가</h2>
        </div>
        <p className="max-w-2xl text-sm text-slate-500">
          학생부 원본과 요약 분석을 바탕으로 강점·보완점·전형 적합성을 함께 보여줍니다.
        </p>
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
        <MetricCard label="평균 등급" value={averageGrade?.toFixed(2) ?? "-"} />
        <MetricCard label="평가 레벨" value={label} />
        <MetricCard label="분석 항목" value={String(subjectCount)} />
        <MetricCard label="최하 등급" value={weakestGrade ? `${weakestGrade}등급` : "-"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#ece0d1] bg-white p-5 shadow-[0_8px_24px_rgba(44,26,10,0.04)]">
          <h3 className="text-lg font-extrabold text-[#1a0f08]">사정관 한줄 평가</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MiniNote title="강점" text={strongestSubject !== "미확인" ? `${strongestSubject} 중심의 흐름이 보입니다.` : "강점 과목을 아직 특정하기 어렵습니다."} />
            <MiniNote title="보완점" text={weakestGrade ? `${weakestGrade}등급 항목의 비중과 분포를 보정할 필요가 있습니다.` : "보완점을 판단할 데이터가 부족합니다."} />
          </div>
        </div>

        <div className="rounded-3xl border border-[#ece0d1] bg-white p-5 shadow-[0_8px_24px_rgba(44,26,10,0.04)]">
          <h3 className="text-lg font-extrabold text-[#1a0f08]">평가 포인트</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• 과목별 성취와 학년 흐름의 일관성</li>
            <li>• 핵심 키워드와 탐구 주제의 연결성</li>
            <li>• 교과/비교과 균형 및 전형 적합성</li>
          </ul>

          {topKeywords.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">핵심 키워드</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topKeywords.slice(0, 6).map((keyword) => (
                  <span key={keyword} className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-semibold text-[#8b1a1a]">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ece0d1] bg-[#faf6f0] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-xl font-black text-[#1a0f08]">{value}</p>
    </div>
  );
}

function MiniNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-[#ece0d1] bg-[#faf6f0] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b1a1a]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
