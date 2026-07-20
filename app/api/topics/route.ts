import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subject = body?.subject || "탐구";
    const interests = Array.isArray(body?.interests) ? body.interests : [];
    const careerHint = body?.careerHint || "진로 연계";

    const topics = [1, 2, 3].map((index) => ({
      id: index,
      title: `${subject} 탐구 주제 ${index}`,
      overview: `${careerHint} 방향으로 확장 가능한 ${subject} 기반 탐구 개요입니다.`,
      reportTemplate: `${subject} 핵심 개념 정리 → 자료 조사 → 비교 분석 → 결론 도출`,
      readingSuggestion: `${subject} 관련 입문 도서 ${index}`,
      keywords: interests.slice(0, 3),
    }));

    return NextResponse.json({
      success: true,
      topics,
      reference_materials: [],
    });
  } catch (error) {
    console.error("Topics API Error:", error);
    return NextResponse.json({ success: false, error: "Topics Generation Error" }, { status: 500 });
  }
}
