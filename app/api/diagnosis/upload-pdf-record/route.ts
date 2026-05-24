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

    let result: any = null;
    let finalRawText = "";
    
    // --- 1. Primary path: Gemini 1.5 Flash API (If API key exists) ---
    const geminiApiKey = process.env.GEMINI_API_KEY || "";
    if (geminiApiKey) {
      console.log("[PDF Parser] Gemini API key detected. Running Gemini 1.5 Flash parser...");
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
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
                  {
                    text: `너는 생활기록부 성적 및 비교과 융합 정밀 분석 전문가야. 제공된 PDF 문서(학생의 학교 생활기록부)를 바탕으로 다음의 평가 항목들을 매우 상세하고 학술적인 수준으로 분석하여 지정된 JSON 스키마 구조로 응답해줘.

분석 및 추출 규칙:
1. '교과 학습 발달 상황' 또는 성적표 영역에서 과목명, 단위수, 석차등급(1~9등급 또는 5등급제)을 정확하게 추출해 subjects 배열에 넣어줘. 성적은 표 형식으로 되어있어.
2. 성적 체계(${gradingSystem})에 맞게 가중 내신 등급 평균(GPA)을 계산하여 gpa 필드에 넣어줘. (가중평균 GPA = 합계(단위수 * 석차등급) / 합계(단위수))
3. 생활기록부의 창체/동아리/세특(세부능력 및 특기사항)을 읽고 학종(학생부종합전형) 서류 평가를 위한 상세 분석(studentAnalysis)을 작성해줘. 한국어로 매우 전문적이고 격조 높은 용어(예: 학술적 탐구력, 구조적 안정성, 변수 통제 등)를 사용하여 상세히 기술해줘.
4. JSON 형식을 정확히 준수하고 어떠한 마크다운 백틱(\`\`\`json)이나 부가 텍스트 없이 순수 JSON 문자열만 반환해줘.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  success: { type: "BOOLEAN" },
                  gpa: { type: "NUMBER" },
                  subjects: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        subject: { type: "STRING" },
                        unit: { type: "INTEGER" },
                        grade: { type: "INTEGER" }
                      },
                      required: ["subject", "unit", "grade"]
                    }
                  },
                  studentAnalysis: {
                    type: "OBJECT",
                    properties: {
                      majorSuitability: { type: "STRING" },
                      majorField: { type: "STRING" },
                      keyKeywords: { type: "ARRAY", items: { type: "STRING" } },
                      academicCapacity: { type: "STRING" },
                      activityAutonomous: { type: "STRING" },
                      activityClub: { type: "STRING" },
                      activityCareer: { type: "STRING" },
                      seTeukAnalysis: { type: "STRING" },
                      comprehensiveOpinion: { type: "STRING" }
                    },
                    required: ["majorSuitability", "majorField", "keyKeywords", "academicCapacity", "seTeukAnalysis", "comprehensiveOpinion"]
                  },
                  message: { type: "STRING" }
                },
                required: ["success", "gpa", "subjects", "studentAnalysis", "message"]
              }
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const responseText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = JSON.parse(responseText);
            if (parsed.success && parsed.subjects && parsed.subjects.length > 0) {
              result = {
                success: true,
                gpa: parsed.gpa,
                subjects: parsed.subjects,
                studentAnalysis: parsed.studentAnalysis,
                message: parsed.message || "성공적으로 학생부 분석을 완료했습니다.",
              };
              console.log("[PDF Parser] Gemini API parsing completed successfully.");
            }
          }
        } else {
          const errMsg = await geminiRes.text();
          console.error(`[PDF Parser] Gemini API returned error HTTP ${geminiRes.status}: ${errMsg}`);
        }
      } catch (err) {
        console.error("[PDF Parser] Gemini API execution failed:", err);
      }
    }

    // --- 2. Secondary path: Client text or Local OCR fallback ---
    if (!result) {
      console.log("[PDF Parser] Falling back to local OCR / text extraction path...");
      const clientExtractedText = String(body?.extractedText ?? "").trim();
      let text = clientExtractedText;
      if (!text) {
        text = extractTextFromPDFBuffer(buffer);
      }
      
      const gpaResult = calculateGPAFromText(text, gradingSystem);
      result = gpaResult;
      finalRawText = text;

      if (!result.success && !clientExtractedText) {
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

