import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function jsonUtf8(body: Record<string, unknown>, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new NextResponse(JSON.stringify(body), {
    ...init,
    headers,
  });
}

type EmailPayload = {
  email: string;
  subject?: string;
  reportData?: Record<string, unknown>;
};

const OUTBOX_DIR = path.join(process.cwd(), ".cache", "suprema-platform", "outbox");

async function saveOutbox(payload: EmailPayload) {
  await fs.mkdir(OUTBOX_DIR, { recursive: true });
  const fileName = `${Date.now()}-${payload.email.replace(/[^a-zA-Z0-9@._-]/g, "_")}.json`;
  await fs.writeFile(path.join(OUTBOX_DIR, fileName), JSON.stringify(payload, null, 2), "utf-8");
}

function buildHtml(payload: EmailPayload) {
  const reportData = payload.reportData || {};
  const studentName = String(reportData.studentName || "학생");
  const schoolName = String(reportData.schoolName || "");
  const grade = String(reportData.grade || "");
  const averageGrade = String(reportData.averageGrade || "-");
  const subject = String(reportData.subject || "");
  const keywords = Array.isArray((reportData as { studentAnalysis?: { keyKeywords?: unknown[] } }).studentAnalysis?.keyKeywords)
    ? ((reportData as { studentAnalysis?: { keyKeywords?: string[] } }).studentAnalysis?.keyKeywords || []).slice(0, 3).join(", ")
    : "";
  const comprehensiveOpinion = String(
    (reportData as { studentAnalysis?: { comprehensiveOpinion?: string } }).studentAnalysis?.comprehensiveOpinion || "",
  );
  const signalCount = Array.isArray(reportData.studentSignals) ? reportData.studentSignals.length : 0;
  const resultCount = Array.isArray((reportData as { results?: unknown[] }).results)
    ? ((reportData as { results?: unknown[] }).results || []).length
    : 0;
  const choiceCount = Array.isArray((reportData as { choices?: unknown[] }).choices)
    ? ((reportData as { choices?: unknown[] }).choices || []).length
    : 0;

  let title = "나의 입시멘토 · 학생부 분석 보고서";
  let summary = "상세 보고서는 앱의 학생부 분석 화면에서 함께 확인할 수 있습니다.";

  if (payload.subject?.includes("탐구")) {
    title = "나의 입시멘토 · 탐구/독서 제안 보고서";
    summary = `학생부 신호 ${signalCount}개, 생성 결과 ${resultCount}건을 포함한 탐구 제안 보고서입니다.`;
  } else if (payload.subject?.includes("입시위치")) {
    title = "나의 입시멘토 · 입시위치진단 보고서";
    summary = `지원 대상 ${choiceCount}건과 최종 판단 결과를 포함한 진단 보고서입니다.`;
  }

  return `
    <div style="font-family: Arial, 'Noto Sans KR', sans-serif; padding: 24px; color: #1f1720;">
      <h1 style="margin: 0 0 16px; color: #8b1a1a;">${title}</h1>
      <p style="margin: 0 0 10px;"><strong>학생명</strong>: ${studentName}</p>
      <p style="margin: 0 0 10px;"><strong>학교</strong>: ${schoolName}</p>
      <p style="margin: 0 0 10px;"><strong>학년</strong>: ${grade}</p>
      <p style="margin: 0 0 10px;"><strong>평균등급</strong>: ${averageGrade}</p>
      ${keywords ? `<p style="margin: 0 0 10px;"><strong>핵심 키워드</strong>: ${keywords}</p>` : ""}
      ${subject ? `<p style="margin: 0 0 10px;"><strong>과목</strong>: ${subject}</p>` : ""}
      <p style="margin: 0;">${summary}</p>
      ${comprehensiveOpinion ? `<p style="margin: 16px 0 0; line-height: 1.6;">${comprehensiveOpinion}</p>` : ""}
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailPayload;
    const email = String(payload.email || "").trim();
    if (!email) {
      return jsonUtf8({ error: "메일 주소가 필요합니다." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY || "";
    const fromEmail = process.env.REPORT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "";
    const subject = payload.subject || "[나의 입시멘토] 학생부 분석 보고서";
    const html = buildHtml(payload);

    if (resendApiKey && fromEmail) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return jsonUtf8({ error: `메일 발송 서비스 오류: ${errorText}` }, { status: 502 });
      }

      return jsonUtf8({ success: true, message: "메일 발송이 완료되었습니다." });
    }

    await saveOutbox({ ...payload, email, subject, reportData: { ...(payload.reportData || {}), html } });
    return jsonUtf8({
      success: true,
      message: "메일 설정이 없어 발송 요청만 저장했습니다. `.cache/suprema-platform/outbox` 를 확인하세요.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return jsonUtf8({ error: "메일 발송 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
