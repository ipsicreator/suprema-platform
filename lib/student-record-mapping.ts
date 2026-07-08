import type { StudentRecordStructured } from "@/lib/student-record";

export type StudentRecordMappingEntry = {
  sourceKey:
    | "schoolInfo"
    | "curriculum"
    | "grades"
    | "sepec"
    | "creativeActivities"
    | "behaviorSummary";
  sourceLabel: string;
  screenTarget: string;
  reportTarget: string;
  description: string;
};

export type StudentRecordMappingRow = {
  source: string;
  target: string;
  reportTarget: string;
  description: string;
  value: string;
  itemCount: number;
};

export const STUDENT_RECORD_MAPPING: StudentRecordMappingEntry[] = [
  {
    sourceKey: "schoolInfo",
    sourceLabel: "인적·학적사항",
    screenTarget: "학생 정보",
    reportTarget: "상단 요약 카드 / 학생 기본정보",
    description: "학생명, 학교, 학년 등 기본 정보를 화면과 보고서 상단에 배치합니다.",
  },
  {
    sourceKey: "curriculum",
    sourceLabel: "교육과정 이수 내역",
    screenTarget: "학생부 원본 보조 정보",
    reportTarget: "원문 항목 부록 / 교육과정 이수",
    description: "이수 과목 축과 교육과정 맥락을 원문 보조 정보로 유지합니다.",
  },
  {
    sourceKey: "grades",
    sourceLabel: "교과학습발달상황",
    screenTarget: "학생부 원본 / 성적 요약",
    reportTarget: "과목별 원문표 / 평균등급 근거표",
    description: "과목, 학년, 학기, 단위, 등급을 추출해 원문표와 평균등급 계산 근거로 사용합니다.",
  },
  {
    sourceKey: "sepec",
    sourceLabel: "세부능력 및 특기사항",
    screenTarget: "요약·비교 분석 / 입학사정관 평가",
    reportTarget: "세특 분석 / 전공적합성 판단 근거",
    description: "세특 원문에서 키워드와 전공 적합성 근거를 추출합니다.",
  },
  {
    sourceKey: "creativeActivities",
    sourceLabel: "창의적 체험활동상황",
    screenTarget: "탐구·독서 제안 / 입학사정관 평가",
    reportTarget: "탐구 신호 / 활동 연계 근거",
    description: "자율, 동아리, 진로, 봉사 흐름을 탐구 주제와 사정관 의견의 근거로 사용합니다.",
  },
  {
    sourceKey: "behaviorSummary",
    sourceLabel: "행동특성 및 종합의견",
    screenTarget: "입학사정관 평가",
    reportTarget: "종합 의견 / 성장 가능성 판단",
    description: "행특·종합의견을 종합 판단과 성장 가능성 의견의 핵심 근거로 사용합니다.",
  },
];

function summarizeSectionValue(section?: { items?: string[]; rawText?: string }, limit = 2) {
  const items = section?.items?.filter(Boolean) || [];
  if (items.length > 0) return items.slice(0, limit).join(", ");
  return section?.rawText?.trim() || "-";
}

export function buildStudentRecordMappingRows(params: {
  structured?: StudentRecordStructured;
  studentName?: string;
  schoolName?: string;
  grade?: string;
  parsedSubjectCount?: number;
}) {
  const { structured, studentName, schoolName, grade, parsedSubjectCount = 0 } = params;

  return STUDENT_RECORD_MAPPING.map((entry): StudentRecordMappingRow => {
    if (entry.sourceKey === "schoolInfo") {
      const value = [studentName, schoolName, grade].filter(Boolean).join(" / ") || "-";
      return {
        source: entry.sourceLabel,
        target: entry.screenTarget,
        reportTarget: entry.reportTarget,
        description: entry.description,
        value,
        itemCount: structured?.schoolInfo.items.length || 0,
      };
    }

    if (entry.sourceKey === "grades") {
      return {
        source: entry.sourceLabel,
        target: entry.screenTarget,
        reportTarget: entry.reportTarget,
        description: entry.description,
        value: parsedSubjectCount > 0 ? `${parsedSubjectCount}개 과목 추출` : summarizeSectionValue(structured?.grades),
        itemCount: structured?.grades.items.length || 0,
      };
    }

    const section = structured?.[entry.sourceKey];
    return {
      source: entry.sourceLabel,
      target: entry.screenTarget,
      reportTarget: entry.reportTarget,
      description: entry.description,
      value: summarizeSectionValue(section),
      itemCount: section?.items.length || 0,
    };
  });
}
