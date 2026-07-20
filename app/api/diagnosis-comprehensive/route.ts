import { NextRequest, NextResponse } from "next/server";

type BasicDiagnosisResult = {
  level?: string;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const basicResults: BasicDiagnosisResult[] = Array.isArray(body?.basicResults) ? body.basicResults : [];

    const finalDiagnosis = basicResults.map((result) => {
      const level = result.level || "보합";
      const advancedComment =
        level === "매우 안정" || level === "안정"
          ? "교과 지표와 학생부 흐름을 함께 보면 안정권입니다. 면접과 서류에서 학생부 근거를 또렷하게 연결하면 좋습니다."
          : level === "상향" || level === "도전"
            ? "교과 기준상 도전 구간입니다. 전공 적합성, 탐구 지속성, 활동의 일관성을 근거로 보강해야 합니다."
            : "컷 기준과 학생부 근거가 혼합된 구간입니다. 대학별 전형 특성에 맞춘 정리가 최종 판단에 필요합니다.";

      return {
        ...result,
        advancedComment,
      };
    });

    return NextResponse.json({ finalDiagnosis });
  } catch (error) {
    console.error("Diagnosis Comprehensive Error:", error);
    return NextResponse.json({ error: "Diagnosis Comprehensive Error" }, { status: 500 });
  }
}
