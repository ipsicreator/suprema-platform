"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "../components/auth/RequireAuth";
import { useSession } from "next-auth/react";
import Script from "next/script";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      requestPayment: (
        method: string,
        params: {
          amount: number;
          orderId: string;
          orderName: string;
          customerName?: string;
          customerEmail?: string;
          successUrl: string;
          failUrl: string;
        },
      ) => Promise<void>;
    };
  }
}

interface Plan {
  planId: string;
  name: string;
  monthlyPriceKrw: number;
  oneTimePriceKrw?: number;
  availableTermsMonths: number[];
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingType, setBillingType] = useState<"subscription" | "one_time">("subscription");
  const [termMonths, setTermMonths] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const { data: session } = useSession();

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/platform/billing");
      const data = await res.json();
      if (data?.success) {
        setPlans(data.plans ?? []);
        if (data.plans?.[0]?.planId) setSelectedPlan(data.plans[0].planId);
      }
    };
    load();
  }, []);

  const activePlan = useMemo(() => plans.find((p) => p.planId === selectedPlan), [plans, selectedPlan]);
  const expectedAmount = useMemo(() => {
    if (!activePlan) return 0;
    if (billingType === "one_time") return activePlan.oneTimePriceKrw ?? activePlan.monthlyPriceKrw;
    return activePlan.monthlyPriceKrw * termMonths;
  }, [activePlan, billingType, termMonths]);

  const handleCreateOrder = async () => {
    if (!selectedPlan) return;
    const overrideAmountKrw = customPrice.trim() ? Number(customPrice) : undefined;
    const res = await fetch("/api/platform/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: selectedPlan,
        provider: "toss",
        billingType,
        termMonths,
        overrideAmountKrw,
      }),
    });
    const data = await res.json();
    if (!data?.success) {
      setMessage(data?.error ?? "주문 생성 실패");
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey || !window.TossPayments) {
      setMessage("토스 결제키 또는 SDK 로딩이 없어 수동 승인 모드로 진행합니다.");
      const confirmRes = await fetch("/api/platform/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.order.orderId,
          paymentKey: `manual_${Date.now()}`,
          amountKrw: data.order.amountKrw,
        }),
      });
      const confirmData = await confirmRes.json();
      setMessage(confirmData?.success ? `결제 처리 완료: 주문 ${data.order.orderId}` : (confirmData?.error ?? "결제 승인 실패"));
      return;
    }

    const toss = window.TossPayments(clientKey);
    await toss.requestPayment("카드", {
      amount: data.order.amountKrw,
      orderId: data.order.orderId,
      orderName: `${activePlan?.name ?? "플랜"} 결제`,
      customerName: session?.user?.name ?? undefined,
      customerEmail: session?.user?.email ?? undefined,
      successUrl: `${window.location.origin}/billing/success`,
      failUrl: `${window.location.origin}/billing/fail`,
    });
  };

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <RequireAuth>
        <Script src="https://js.tosspayments.com/v1/payment" strategy="afterInteractive" />
        <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 className="page-title" style={{ fontSize: "2rem" }}>결제/구독</h1>
          <p className="page-subtitle">월결제(1/3/6개월) 또는 1회 결제를 선택하세요.</p>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">상품</label>
              <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}>
                {plans.map((p) => (
                  <option key={p.planId} value={p.planId}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">결제 타입</label>
              <select value={billingType} onChange={(e) => setBillingType(e.target.value as "subscription" | "one_time")}>
                <option value="subscription">월 구독</option>
                <option value="one_time">1회 결제</option>
              </select>
            </div>

            {billingType === "subscription" && (
              <div className="form-group">
                <label className="form-label">기간(개월)</label>
                <select value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))}>
                  {(activePlan?.availableTermsMonths ?? [1, 3, 6]).map((m) => (
                    <option key={m} value={m}>{m}개월</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">별도 가격(선택)</label>
              <input value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="예: 199000" />
            </div>
          </div>

          <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
            예상 결제금액: <strong style={{ color: "white" }}>{expectedAmount.toLocaleString()}원</strong>
          </p>

          <button className="btn-primary" type="button" onClick={handleCreateOrder} style={{ marginTop: "1rem" }}>
            결제 진행
          </button>

          {message && <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>{message}</p>}
        </div>
      </RequireAuth>
    </main>
  );
}
