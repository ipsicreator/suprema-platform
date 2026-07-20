export interface ExtractedSubject {
  subject: string;
  unit: number;
  grade: number;
  year?: number;
  semester?: number;
}

export interface UserInfo {
  consultantName: string;
  studentName: string;
  schoolName: string;
  grade: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  studentIndex?: number;
  gradingSystem?: "9-level" | "5-level";
  careerHint: string;
  supportTrack?: string;
  hopeDepartment?: string;
  parsedSubjects?: ExtractedSubject[];
  studentAnalysis?: {
    majorField?: string;
    majorSuitability?: string;
    keyKeywords?: string[];
    academicCapacity?: string;
    seTeukAnalysis?: string;
    comprehensiveOpinion?: string;
  };
}

export function formatGradePair(userInfo?: Partial<UserInfo> | null): string {
  if (!userInfo) {
    return "-";
  }

  const grade = String(userInfo.grade || "").trim();
  const studentIndex = userInfo.studentIndex;

  if (grade && Number.isFinite(studentIndex)) {
    return `${grade}학년 ${studentIndex}등급`;
  }

  if (grade) {
    return `${grade}학년`;
  }

  if (Number.isFinite(studentIndex)) {
    return `${studentIndex}등급`;
  }

  return "-";
}
