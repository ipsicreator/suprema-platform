import { NextRequest, NextResponse } from "next/server";
import { addUsageLog } from "@/lib/platform-store";
import { getCurrentUserOrThrow } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserOrThrow();
    const body = (await req.json()) as {
      service?: "setuk" | "diagnosis";
      action?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.service || !body.action) {
      return NextResponse.json({ success: false, error: "service와 action이 필요합니다." }, { status: 400 });
    }

    await addUsageLog({
      userId: currentUser.userId,
      service: body.service,
      action: body.action,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "사용 로그 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
