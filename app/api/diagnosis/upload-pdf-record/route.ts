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
                message: parsed.message || "?깃났?곸쑝濡??숈깮遺 遺꾩꽍???꾨즺?덉뒿?덈떎.",
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
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "server_error" },
      { status: 500 },
    );
  }
}
