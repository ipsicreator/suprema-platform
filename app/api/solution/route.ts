import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type RecommendedBook = {
  title: string;
  author: string;
  reason: string;
};

type GeminiTopicResponse = {
  extractedKeywords?: string[];
  proposedTopic?: string;
  explorationPath?: string;
  recommendedBooks?: RecommendedBook[];
};

type SolutionRequestBody = {
  userKeywords?: string[];
  department?: string;
  studentRecord?: string;
  academyId?: string;
};

function generateHash(data: unknown) {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SolutionRequestBody;
    const { userKeywords = [], department = "", studentRecord = "", academyId } = body;

    const { checkLicense } = await import("@/lib/auth");
    const isLicensed = await checkLicense(academyId || "demo_academy");
    if (!isLicensed) {
      return NextResponse.json({ error: "유효한 라이선스가 없습니다." }, { status: 403 });
    }

    const inputHash = generateHash({ userKeywords, department, studentRecord });
    const pb = (await import("@/lib/pocketbase")).default;

    try {
      const existingRecord = await pb.collection("suprema_pdf_analyses").getFirstListItem(`input_hash="${inputHash}"`);
      if (existingRecord) {
        return NextResponse.json(JSON.parse(existingRecord.content as string));
      }
    } catch {
      // 기존 기록이 없으면 새로 생성
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const analysisPrompt = `
입시 전문가로서 다음 기록을 분석해 핵심 키워드 2개를 추출하고,
사용자 키워드(${userKeywords.join(", ")})와 통합한 심화 탐구 및 연계 독서를 제안해 주세요.

기록: ${studentRecord}
학과: ${department}

응답 형식(JSON):
{
  "extractedKeywords": ["키워드1", "키워드2"],
  "proposedTopic": "심화 탐구 제목",
  "explorationPath": "탐구 수행 방법",
  "recommendedBooks": [
    { "title": "도서명", "author": "저자", "reason": "추천 이유" }
  ]
}
`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}") as GeminiTopicResponse;

    const finalPrompt = `탐구 '${parsed.proposedTopic || "미정"}'를 바탕으로 500자 이내의 세특 문장 초안을 작성해 주세요.`;
    const finalRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
    });
    const finalData = (await finalRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const specialRecord = finalData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const finalResult = { ...parsed, specialRecord };

    try {
      await pb.collection("suprema_pdf_analyses").create({
        student_name: "통합사용자",
        analysis_type: "AI_EXPLORATION",
        input_hash: inputHash,
        content: JSON.stringify(finalResult),
        created_at: new Date().toISOString(),
      });
    } catch (pbError) {
      console.warn("DB Accumulation Failed:", pbError);
    }

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("AI Data Accumulation Error:", error);
    return NextResponse.json({ error: "데이터 처리 중 오류 발생" }, { status: 500 });
  }
}
