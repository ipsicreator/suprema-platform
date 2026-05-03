import { NextRequest, NextResponse } from "next/server";
import { createCheckoutOrder, getPlansAndSubscriptions, updatePlanPricing } from "@/lib/platform-store";
import { getCurrentUserOrThrow, requireAdminOrThrow } from "@/lib/server-auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUserOrThrow();
    const billing = await getPlansAndSubscriptions(currentUser.userId);
    return NextResponse.json({ success: true, ...billing });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "결제 정보 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserOrThrow();
    const body = (await req.json()) as {
      planId?: string;
      provider?: "toss" | "iamport" | "stripe" | "manual";
      termMonths?: number;
      billingType?: "subscription" | "one_time";
      overrideAmountKrw?: number;
    };
    if (!body.planId) {
      return NextResponse.json({ success: false, error: "planId가 필요합니다." }, { status: 400 });
    }
    const billingType = body.billingType ?? "subscription";
    const termMonths = body.termMonths ?? 1;
    if (billingType === "subscription" && ![1, 3, 6].includes(termMonths)) {
      return NextResponse.json({ success: false, error: "termMonths는 1, 3, 6만 가능합니다." }, { status: 400 });
    }
    const provider = body.provider ?? "manual";
    const order = await createCheckoutOrder({
      userId: currentUser.userId,
      planId: body.planId,
      provider,
      billingType,
      termMonths,
      overrideAmountKrw: body.overrideAmountKrw,
    });
    return NextResponse.json({
      success: true,
      message: "결제 요청이 생성되었습니다. 실제 PG 연동 시 이 주문 정보를 결제창으로 전달하면 됩니다.",
      order,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "결제 요청 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminOrThrow();
    const body = (await req.json()) as {
      planId?: string;
      monthlyPriceKrw?: number;
      oneTimePriceKrw?: number;
      availableTermsMonths?: number[];
      name?: string;
    };
    if (!body.planId) {
      return NextResponse.json({ success: false, error: "planId가 필요합니다." }, { status: 400 });
    }
    const updated = await updatePlanPricing({
      planId: body.planId,
      monthlyPriceKrw: body.monthlyPriceKrw,
      oneTimePriceKrw: body.oneTimePriceKrw,
      availableTermsMonths: body.availableTermsMonths,
      name: body.name,
    });
    return NextResponse.json({ success: true, plan: updated });
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
    return NextResponse.json({ success: false, error: "상품 가격 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
