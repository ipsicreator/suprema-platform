export type ExtractedSubject = {
  subject: string;
  unit?: number;
  grade?: number | string;
  year?: number | string;
  semester?: string;
  rawScore?: number;
  scoreAverage?: number;
  achievementLevel?: string;
  studentCount?: number;
};

export type UserInfo = {
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
  hopeDepartment?: string;
  supportTrack?: string;
  parsedSubjects?: ExtractedSubject[];
  studentRecord?: unknown;
  studentAnalysis?: {
    keyKeywords?: string[];
    academicCapacity?: string;
    seTeukAnalysis?: string;
    majorSuitability?: string;
    comprehensiveOpinion?: string;
    majorField?: string;
  };
};

export function loadSavedUserInfo(): Partial<UserInfo> | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.sessionStorage.getItem("suprema_user_info");
    return saved ? (JSON.parse(saved) as Partial<UserInfo>) : null;
  } catch {
    return null;
  }
}

export function resolveDiagnosisGrade(info: Partial<UserInfo> | null | undefined): number | null {
  const value = Number(info?.studentIndex);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function formatGradePair(info: Partial<UserInfo> | null | undefined): string {
  const grade = resolveDiagnosisGrade(info);
  if (grade === null) return "-";
  return `${grade.toFixed(2)}등급`;
}
