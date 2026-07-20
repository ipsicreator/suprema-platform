import type { StudentRecordReportData } from "@/lib/report-data";

type MappingInput = {
  structured: StudentRecordReportData["studentRecord"];
  studentName: string;
  schoolName: string;
  grade: string;
  parsedSubjectCount: number;
};

export type StudentRecordMappingRow = {
  source: string;
  target: string;
  value: string;
};

export function buildStudentRecordMappingRows(input: MappingInput): StudentRecordMappingRow[] {
  const rows: StudentRecordMappingRow[] = [
    {
      source: "학생 기본 정보",
      target: `${input.schoolName} / ${input.grade} / ${input.studentName}`,
      value: `학생명 ${input.studentName}, 학교명 ${input.schoolName}, 학년 ${input.grade}`,
    },
    {
      source: "과목 수",
      target: "학업 이력 집계",
      value: `확인된 과목 수 ${input.parsedSubjectCount}개`,
    },
  ];

  const sections = [
    input.structured.schoolInfo,
    input.structured.curriculum,
    input.structured.grades,
    input.structured.sepec,
    input.structured.creativeActivities,
    input.structured.behaviorSummary,
  ].filter((section): section is NonNullable<typeof section> => Boolean(section));

  for (const section of sections) {
    rows.push({
      source: section.title,
      target: "원문 매핑",
      value: section.items.join(" · ") || `${section.title} 정보 없음`,
    });
  }

  return rows;
}
