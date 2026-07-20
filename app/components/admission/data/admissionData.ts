import admissionData from "../../../../data/admission/admissionData.json";

export type AdmissionRow = {
  region: string;
  subRegion: string;
  univ: string;
  track: string;
  dept: string;
  type: string;
  name: string;
  req?: string;
  minRequirement?: string;
  method?: string;
  documents?: string;
  duplicateSupport?: string;
  gradeRatio?: string;
  subjects?: string;
  careerSelectionSubjects?: string;
  resultGradeCompetition?: string;
  cutoff24: number | null;
  cutoff25: number | null;
  cutoff26: number | null;
  cutoff26_50?: number | null;
  cutoff26_70?: number | null;
  competition24?: number | null;
  competition25?: number | null;
  competition26?: number | null;
  reference24?: string;
  reference25?: string;
  reference26?: string;
  supportNotes?: string;
  remarks?: string;
};

export const ADMISSION_DATA = admissionData as AdmissionRow[];
