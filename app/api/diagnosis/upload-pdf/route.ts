import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDFBuffer, calculateGPAFromText } from "@/lib/pdf-parser";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const gradingSystem = (formData.get("gradingSystem") as "5-level" | "9-level") || "9-level";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "?낅줈?쒕맂 ?뚯씪???놁뒿?덈떎." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = extractTextFromPDFBuffer(buffer);
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
  } catch (error: any) {
    console.error("PDF upload and analysis failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "PDF 遺꾩꽍 ?꾩쨷 ?쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎." },
      { status: 500 }
    );
  }
}
