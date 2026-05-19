import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDFBuffer, calculateGPAFromText } from "@/lib/pdf-parser";
import pb from "@/lib/pocketbase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const gradingSystem = (formData.get("gradingSystem") as "5-level" | "9-level") || "9-level";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "업로드된 파일이 없습니다." },
        { status: 400 }
      );
    }

    // Convert file object to Buffer in-memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF buffer
    const text = extractTextFromPDFBuffer(buffer);
    
    // Calculate GPA based on the grading system (5-level or 9-level)
    let result = calculateGPAFromText(text, gradingSystem);
    let finalRawText = text;
    let usedOCR = false;

    if (!result.success) {
      // Scanned PDF Fallback: Extract DCTDecode JPEGs and perform local OCR
      const { extractJPEGsFromPDFBuffer, performOCRForPDFImages } = await import("@/lib/pdf-parser");
      const images = extractJPEGsFromPDFBuffer(buffer);
      
      if (images.length > 0) {
        console.log(`[PDF Parser] Scanned PDF detected with ${images.length} images. Initiating local OCR...`);
        const ocrText = await performOCRForPDFImages(images);
        
        if (ocrText.trim().length > 0) {
          result = calculateGPAFromText(ocrText, gradingSystem);
          finalRawText = ocrText;
          usedOCR = true;
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
        gpa: 0
      });
    }

    // PocketBase database logging is bypassed locally to avoid network timeout delays.
    // The GPA and subjects are computed in-memory and returned instantly.

    return NextResponse.json({
      success: true,
      gpa: result.gpa,
      subjects: result.subjects,
      studentAnalysis: result.studentAnalysis,
      message: result.message
    });

  } catch (error: any) {
    console.error("PDF upload and analysis failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "PDF 분석 도중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
