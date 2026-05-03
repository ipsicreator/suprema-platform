"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BillingSuccessPage() {
  const [message, setMessage] = useState("결제 승인 처리 중...");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const orderId = params.get("orderId");
      const paymentKey = params.get("paymentKey");
      const amount = Number(params.get("amount") ?? "0");
      if (!orderId || !paymentKey || !amount) {
        setMessage("필수 결제 파라미터가 없습니다.");
        return;
      }
      const res = await fetch("/api/platform/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentKey, amountKrw: amount }),
      });
      const data = await res.json();
      setMessage(data?.success ? "결제 완료 및 구독 상태 반영 완료" : (data?.error ?? "결제 승인 실패"));
    };
    run();
  }, []);

  return (
    <main className="container" style={{ paddingTop: "3rem" }}>
      <div className="glass-card" style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
        <h1 className="page-title" style={{ fontSize: "2rem" }}>결제 성공</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>{message}</p>
        <Link href="/" className="btn-primary" style={{ marginTop: "1rem" }}>홈으로 이동</Link>
      </div>
    </main>
  );
}
