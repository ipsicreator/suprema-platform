import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/platform-store";
import { getCurrentUserOrThrow } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
  try {
    await getCurrentUserOrThrow();
    const body = (await req.json()) as {
      orderId?: string;
      paymentKey?: string;
      amountKrw?: number;
    };
    if (!body.orderId || !body.paymentKey || typeof body.amountKrw !== "number") {
      return NextResponse.json({ success: false, error: "orderId, paymentKey, amountKrw가 필요합니다." }, { status: 400 });
    }

    const order = await getOrderById(body.orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "주문 정보를 찾을 수 없습니다." }, { status: 404 });
    }
    if (order.amountKrw !== body.amountKrw) {
      return NextResponse.json({ success: false, error: "결제 금액 불일치" }, { status: 400 });
    }

    if (order.provider !== "toss" || !process.env.TOSS_SECRET_KEY) {
      const updated = await updateOrderStatus({
        orderId: body.orderId,
        status: "paid",
        paymentKey: body.paymentKey,
      });
      return NextResponse.json({
        success: true,
        message: "테스트/수동 모드로 결제 완료 처리했습니다.",
        order: updated,
      });
    }

    const auth = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");
    const confirmRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentKey: body.paymentKey,
        orderId: body.orderId,
        amount: body.amountKrw,
      }),
    });

    if (!confirmRes.ok) {
      const fail = await confirmRes.text();
      await updateOrderStatus({ orderId: body.orderId, status: "failed", failureReason: fail });
      return NextResponse.json({ success: false, error: "토스 승인 실패", detail: fail }, { status: 400 });
    }

    await updateOrderStatus({ orderId: body.orderId, status: "paid", paymentKey: body.paymentKey });
    return NextResponse.json({ success: true, message: "토스 결제 승인 완료" });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "결제 승인 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
