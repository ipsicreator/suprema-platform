import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/platform-store";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody) as {
      eventType?: string;
      data?: { orderId?: string; paymentKey?: string; method?: string };
    };
    const webhookSecret = process.env.TOSS_WEBHOOK_SECRET;
    const transmissionTime = req.headers.get("tosspayments-webhook-transmission-time");
    const signature = req.headers.get("tosspayments-webhook-signature");
    if (webhookSecret && signature && transmissionTime) {
      const source = `${rawBody}:${transmissionTime}`;
      const digest = crypto.createHmac("sha256", webhookSecret).update(source).digest();
      const expectedBase64 = digest.toString("base64");
      const expectedHex = digest.toString("hex");
      if (signature !== expectedBase64 && signature !== expectedHex) {
        return NextResponse.json({ success: false, error: "유효하지 않은 웹훅 서명입니다." }, { status: 401 });
      }
    }

    const orderId = body.data?.orderId;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId가 없습니다." }, { status: 400 });
    }

    if (body.eventType === "PAYMENT_STATUS_CHANGED" || body.eventType === "PAYMENT_COMPLETED") {
      await updateOrderStatus({
        orderId,
        status: "paid",
        paymentKey: body.data?.paymentKey,
      });
    }

    if (body.eventType === "PAYMENT_CANCELED") {
      await updateOrderStatus({ orderId, status: "refunded" });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "웹훅 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
