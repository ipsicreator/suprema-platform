import type { UserInfo } from "@/lib/user-info";
import { resolveDiagnosisGrade } from "@/lib/user-info";
import type { StudentRecordReportData } from "@/app/components/student-record/StudentRecordReport";
import type { StudentRecordStructured } from "@/lib/student-record";

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const normalized = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(normalized) ? normalized : undefined;
  }
  return undefined;
}

export function toStudentRecordReportData(info: Partial<UserInfo> | null | undefined): StudentRecordReportData {
  return {
    studentName: info?.studentName || "",
    schoolName: info?.schoolName || "",
    grade: info?.grade || "",
    email: info?.email || "",
    supportTrack: info?.supportTrack || "",
    careerHint: info?.careerHint || "",
    averageGrade: resolveDiagnosisGrade(info) ?? undefined,
    averageGradeRaw: typeof info?.studentIndex === "number" ? info.studentIndex : undefined,
    parsedSubjects: Array.isArray(info?.parsedSubjects)
      ? info.parsedSubjects.map((subject) => ({
          ...subject,
          unit: toOptionalNumber(subject.unit),
          grade: toOptionalNumber(subject.grade),
          year: toOptionalNumber(subject.year),
          semester: toOptionalNumber(subject.semester),
          rawScore: toOptionalNumber(subject.rawScore),
          scoreAverage: toOptionalNumber(subject.scoreAverage),
          achievement: subject.achievementLevel,
          studentCount: toOptionalNumber(subject.studentCount),
        }))
      : [],
    studentRecord: info?.studentRecord as StudentRecordStructured | undefined,
    studentAnalysis: info?.studentAnalysis,
  };
}
