import type { PDFAnalysisResult } from "@/lib/pdf-parser";
import type { UserInfo } from "@/lib/user-info";

type UploadSummary = {
  gradeText: string;
  subjectText: string;
  keywordText: string;
};

type UploadPreview = {
  subjects: Array<{
    subject: string;
    grade: string;
    semester: string;
  }>;
  opinion: string;
};

function toParsedSubjectSemester(subject: { year?: number; semester?: number }) {
  if (subject.year && subject.semester) {
    return `${subject.year}-${subject.semester}`;
  }
  if (subject.semester) {
    return String(subject.semester);
  }
  return undefined;
}

export function mergePdfAnalysisIntoUserInfo(
  info: Partial<UserInfo>,
  analysis: PDFAnalysisResult,
): Partial<UserInfo> {
  if (!analysis.success) {
    return info;
  }

  return {
    ...info,
    studentIndex: Number.isFinite(analysis.gpa) && analysis.gpa > 0 ? analysis.gpa : info.studentIndex,
    parsedSubjects: analysis.subjects.map((subject) => ({
      subject: subject.subject,
      unit: subject.unit,
      grade: subject.grade,
      year: subject.year,
      semester: subject.semester,
      rawScore: subject.rawScore,
      scoreAverage: subject.scoreAverage,
      achievementLevel: subject.achievementLevel,
      studentCount: subject.studentCount,
    })),
    studentAnalysis: {
      ...(info.studentAnalysis || {}),
      ...((analysis.studentAnalysis || {}) as UserInfo["studentAnalysis"]),
    },
  };
}

export function resetPdfAnalysisFromUserInfo(info: Partial<UserInfo>): Partial<UserInfo> {
  return {
    ...info,
    studentIndex: undefined,
    parsedSubjects: [],
    studentAnalysis: undefined,
  };
}

export function buildPdfUploadSummary(info: Partial<UserInfo>): UploadSummary | null {
  const subjectCount = Array.isArray(info.parsedSubjects) ? info.parsedSubjects.length : 0;
  const keywordCount = Array.isArray(info.studentAnalysis?.keyKeywords) ? info.studentAnalysis.keyKeywords.length : 0;
  const grade = typeof info.studentIndex === "number" && Number.isFinite(info.studentIndex) ? info.studentIndex : null;

  if (!subjectCount && grade === null && !keywordCount) {
    return null;
  }

  return {
    gradeText: `평균 등급 ${grade !== null ? grade.toFixed(2) : "-"}`,
    subjectText: `분석 과목 ${subjectCount}개`,
    keywordText: `핵심 키워드 ${keywordCount}개`,
  };
}

export function buildPdfUploadPreview(info: Partial<UserInfo>): UploadPreview | null {
  const subjects = Array.isArray(info.parsedSubjects)
    ? info.parsedSubjects.slice(0, 3).map((subject) => ({
        subject: subject.subject,
        grade: subject.grade !== undefined ? `${subject.grade}등급` : "-",
        semester: subject.semester ? `${subject.semester}` : "학기 미확인",
      }))
    : [];

  const opinion =
    info.studentAnalysis?.comprehensiveOpinion || "학생부 분석 후 핵심 문장과 종합 의견이 이 영역에 표시됩니다.";

  if (!subjects.length && !info.studentAnalysis?.comprehensiveOpinion) {
    return null;
  }

  return {
    subjects,
    opinion,
  };
}
