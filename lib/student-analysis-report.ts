import type { UserInfo } from "@/lib/user-info";

export type StudentAnalysisReportSummary = {
  overallSummary: string;
  strengths: string[];
  cautions: string[];
  interviewPoints: string[];
};

function safeArray(values: string[] | undefined): string[] {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

export function buildStudentAnalysisReportSummary(
  info: Partial<UserInfo> | null | undefined,
): StudentAnalysisReportSummary {
  const keywords = safeArray(info?.studentAnalysis?.keyKeywords);
  const subjects = Array.isArray(info?.parsedSubjects) ? info.parsedSubjects : [];
  const weakSubjects = subjects
    .filter((subject) => {
      const value = typeof subject.grade === "number" ? subject.grade : Number(subject.grade);
      return Number.isFinite(value) && value >= 3;
    })
    .map((subject) => subject.subject)
    .filter(Boolean);

  const supportTrack =
    info?.supportTrack || info?.hopeDepartment || info?.careerHint || info?.studentAnalysis?.majorField || "희망 전공";

  const overallSummary =
    info?.studentAnalysis?.comprehensiveOpinion ||
    `${supportTrack} 중심으로 학생부 전체 흐름을 다시 정리할 필요가 있습니다.`;

  const strengths = [
    info?.studentAnalysis?.majorSuitability ? `전공 적합성: ${info.studentAnalysis.majorSuitability}` : "",
    keywords.length > 0 ? `핵심 키워드: ${keywords.slice(0, 3).join(", ")}` : "",
    info?.studentAnalysis?.academicCapacity ? `학업역량: ${info.studentAnalysis.academicCapacity}` : "",
    subjects.length > 0 ? `교과 데이터 ${subjects.length}건이 연결되어 있습니다.` : "",
  ].filter(Boolean);

  const cautions = [
    weakSubjects.length > 0 ? `보완 과목: ${weakSubjects.join(", ")}` : "",
    subjects.length === 0 ? "교과 데이터가 아직 부족합니다." : "",
    !info?.studentAnalysis?.majorSuitability ? "전공 적합성 문구를 추가 정리할 필요가 있습니다." : "",
  ].filter(Boolean);

  const interviewPoints = [
    `${supportTrack}에 관심을 가지게 된 계기 설명`,
    "학생부에서 가장 기억에 남는 탐구 활동 정리",
    "자료 조사와 비교 분석 과정을 어떻게 진행했는지 설명",
    keywords.length > 0
      ? `키워드 ${keywords.slice(0, 2).join(", ")}를 중심으로 전공 확장성 설명`
      : "핵심 키워드를 중심으로 전공 확장성 설명",
  ];

  return {
    overallSummary,
    strengths,
    cautions,
    interviewPoints,
  };
}
