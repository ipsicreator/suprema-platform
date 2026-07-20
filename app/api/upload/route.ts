import { NextRequest, NextResponse } from "next/server";
import { calculateGPAFromText, extractTextFromPDFBuffer } from "@/lib/pdf-parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const gradingSystem = (formData.get("gradingSystem") as "5-level" | "9-level" | null) || "9-level";

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      text = extractTextFromPDFBuffer(buffer);
    } else if (file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "이미지 OCR 경로는 별도 정비가 필요합니다. 현재는 PDF 업로드만 지원합니다." },
        { status: 400 }
      );
    } else {
      return NextResponse.json({ success: false, error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
    }

    const analysis = calculateGPAFromText(text, gradingSystem);
    return NextResponse.json({ success: true, rawText: text, analysis });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: "업로드 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
