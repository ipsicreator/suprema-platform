import { NextResponse } from "next/server";
import { pbAdmin, hasPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
import { extractTextFromPDFBuffer, calculateGPAFromText } from "@/lib/pdf-parser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ success: false, error: "pocketbase_not_configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as any;
  const recordId = String(body?.recordId ?? "").trim();
  const gradingSystem = (String(body?.gradingSystem ?? "9-level") as "5-level" | "9-level") || "9-level";

  if (!recordId) {
    return NextResponse.json({ success: false, error: "recordId_required" }, { status: 400 });
  }

  try {
    const pb = await pbAdmin();
    const record = await pb.collection("suprema_pdf_uploads").getOne(recordId);
    const fileName = String(record?.file ?? "").trim();
    if (!fileName) {
      return NextResponse.json({ success: false, error: "file_missing" }, { status: 400 });
    }

    const fileUrl = pb.files.getUrl(record, fileName);
    const res = await fetch(fileUrl, {
      headers: { Authorization: pb.authStore.token },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `file_download_failed_${res.status}` },
        { status: 502 },
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = extractTextFromPDFBuffer(buffer);
    let result = calculateGPAFromText(text, gradingSystem);
    let finalRawText = text;

    if (!result.success) {
      const { extractJPEGsFromPDFBuffer, performOCRForPDFImages } = await import("@/lib/pdf-parser");
      const images = extractJPEGsFromPDFBuffer(buffer);
      if (images.length > 0) {
        const ocrText = await performOCRForPDFImages(images);
        if (ocrText.trim().length > 0) {
          result = calculateGPAFromText(ocrText, gradingSystem);
          finalRawText = ocrText;
          if (result.success) {
            result.message += " (이미지 스캔 생기부 OCR 분석 반영 완료)";
          }
        }
      }
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
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "server_error" },
      { status: 500 },
    );
  }
}

