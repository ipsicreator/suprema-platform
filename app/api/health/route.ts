import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function checkPocketBaseReachable(pbUrl: string | null) {
  if (!pbUrl) {
    return {
      configured: false,
      reachable: false,
      status: "not_configured" as const,
      message: "PocketBase URL이 설정되지 않았습니다.",
    };
  }

  try {
    const res = await fetch(`${pbUrl.replace(/\/$/, "")}/api/health`, {
      method: "GET",
      cache: "no-store",
    });

    return {
      configured: true,
      reachable: res.ok,
      status: res.ok ? ("ok" as const) : ("unreachable" as const),
      message: res.ok ? "PocketBase 연결 가능" : "PocketBase 응답 실패",
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      status: "unreachable" as const,
      message: "PocketBase 연결 실패",
    };
  }
}

function getMailStatus() {
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.REPORT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "";
  const configured = Boolean(resendApiKey && fromEmail);

  return {
    configured,
    status: configured ? ("live_send" as const) : ("outbox_fallback" as const),
    message: configured ? "Resend 실발송 가능" : "메일 설정 없음, outbox 저장 모드",
  };
}

export async function GET() {
  const pbUrl = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || null;
  const pocketbase = await checkPocketBaseReachable(pbUrl);
  const mail = getMailStatus();

  return NextResponse.json(
    {
      ok: true,
      app: "suprema-platform",
      service: "나의 입시멘토",
      routes: {
        intro: "/",
        diagnosis: [
          "/diagnosis",
          "/diagnosis/step1",
          "/diagnosis/step2",
          "/diagnosis/step3",
          "/diagnosis/step4",
        ],
      },
      vercel: {
        env: process.env.VERCEL_ENV || null,
        git: {
          sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
          ref: process.env.VERCEL_GIT_COMMIT_REF || null,
        },
      },
      pocketbase: {
        url: pbUrl,
        ...pocketbase,
      },
      mail,
    },
    { status: 200 },
  );
}
