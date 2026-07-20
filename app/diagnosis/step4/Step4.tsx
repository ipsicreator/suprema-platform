"use client";

import ReportComponent from "../report";

type ReportResult = {
  university: string;
  department: string;
  track_name?: string;
  y24?: string;
  y25?: string;
  y26?: string;
  trend?: string;
  level: string;
  comment: string;
};

type StudentInfo = {
  name: string;
  grade: string;
  score: string;
  parsedSubjects?: Array<{ subject: string; unit: string | number; grade: string | number }>;
  gradingSystem?: string;
};

interface Step4Props {
  evaluated: ReportResult[];
  userInfo: StudentInfo;
  onReset: () => void;
}

export default function Step4({ evaluated, userInfo, onReset }: Step4Props) {
  return <ReportComponent results={evaluated} studentInfo={userInfo} onReset={onReset} />;
}
