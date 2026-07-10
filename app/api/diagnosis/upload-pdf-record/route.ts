import { NextResponse } from "next/server";
import { pbAdmin, hasPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
import { extractTextFromPDFBuffer, calculateGPAFromText, type ExtractedSubject } from "@/lib/pdf-parser";

export const runtime = "nodejs";

type UploadPdfRecordRequest = {
  recordId?: string;
  gradingSystem?: "5-level" | "9-level";
  extractedText?: string;
};

type GeminiPdfParsedResult = {
  success?: boolean;
  gpa?: number;
  subjects?: ExtractedSubject[];
  studentAnalysis?: Record<string, unknown>;
  message?: string;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export async function POST(req: Request) {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ success: false, error: "PDF 분석 저장소 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as UploadPdfRecordRequest | null;
  const recordId = String(body?.recordId ?? "").trim();
  const gradingSystem = (String(body?.gradingSystem ?? "9-level") as "5-level" | "9-level") || "9-level";

  if (!recordId) {
    return NextResponse.json({ success: false, error: "분석할 PDF 기록 ID가 없습니다." }, { status: 400 });
  }

  try {
    const pb = await pbAdmin();
    const record = await pb.collection("suprema_pdf_uploads").getOne(recordId);
    const fileName = String(record?.file ?? "").trim();
    if (!fileName) {
      return NextResponse.json({ success: false, error: "업로드된 PDF 파일 정보를 찾지 못했습니다." }, { status: 400 });
    }

    const fileUrl = pb.files.getUrl(record, fileName);
    const res = await fetch(fileUrl, {
      headers: { Authorization: pb.authStore.token },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `PDF 파일 다운로드에 실패했습니다. (${res.status})` },
        { status: 502 },
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let result: ReturnType<typeof calculateGPAFromText> | null = null;
    let finalRawText = "";

    const geminiApiKey = process.env.GEMINI_API_KEY || "";
    if (geminiApiKey) {
      console.log("[PDF Parser] Gemini API key detected. Running Gemini 1.5 Flash parser...");
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: buffer.toString("base64"),
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (geminiRes.ok) {
          const geminiJson = (await geminiRes.json()) as GeminiGenerateResponse;
          const responseText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = JSON.parse(responseText) as GeminiPdfParsedResult;
            if (parsed.success && typeof parsed.gpa === "number" && parsed.subjects && parsed.subjects.length > 0) {
              result = {
                success: true,
                gpa: parsed.gpa,
                subjects: parsed.subjects,
                studentAnalysis: parsed.studentAnalysis,
                message: parsed.message || "성공적으로 학생부 분석이 완료되었습니다.",
              };
            }
          }
        }
      } catch (err) {
        console.error("[PDF Parser] Gemini API execution failed:", err);
      }
    }

    if (!result) {
      const clientExtractedText = String(body?.extractedText ?? "").trim();
      const text = clientExtractedText || extractTextFromPDFBuffer(buffer);
      finalRawText = text;
      result = calculateGPAFromText(text, gradingSystem);
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message,
        subjects: [],
        gpa: 0,
      });
    }

    return NextResponse.json({
      success: true,
      gpa: result.gpa,
      subjects: result.subjects,
      studentAnalysis: result.studentAnalysis,
      message: result.message,
      rawTextLength: finalRawText.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PDF 분석 중 서버 오류가 발생했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
