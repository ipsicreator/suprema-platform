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
