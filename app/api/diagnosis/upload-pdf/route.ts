import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { extractTextFromPDFBuffer, calculateGPAFromText } from "@/lib/pdf-parser";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const gradingSystem = (formData.get("gradingSystem") as "5-level" | "9-level") || "9-level";

    if (!file) {
      return NextResponse.json({ success: false, error: "업로드한 파일이 없습니다." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "빈 파일은 분석할 수 없습니다." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "파일 용량이 너무 큽니다. 20MB 이하 PDF를 업로드해 주세요." },
        { status: 400 },
      );
    }

    const isPdfMime = file.type === "application/pdf";
    const isPdfName = file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfMime && !isPdfName) {
      return NextResponse.json({ success: false, error: "PDF 파일만 분석할 수 있습니다." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = extractTextFromPDFBuffer(buffer);
    if (!text.trim()) {
      const parsed = await pdf(buffer).catch(() => null);
      text = parsed?.text || "";
    }

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "PDF에서 읽을 수 있는 텍스트를 찾지 못했습니다. 스캔본이면 더 선명한 파일로 다시 시도해 주세요.",
        },
        { status: 400 },
      );
    }

    const result = calculateGPAFromText(text, gradingSystem);

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
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PDF 분석 요청 중 서버 오류가 발생했습니다.";
    console.error("PDF upload and analysis failed:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
