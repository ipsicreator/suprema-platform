import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/platform-store";
import { requireAdminOrThrow } from "@/lib/server-auth";

export async function GET() {
  try {
    await requireAdminOrThrow();
    const orders = await getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "ADMIN_NOT_CONFIGURED") {
      return NextResponse.json({ success: false, error: "ADMIN_EMAILS 환경변수를 설정해주세요." }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: "결제내역 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
