"use client";

import Link from "next/link";

export default function BillingFailPage() {
  return (
    <main className="container" style={{ paddingTop: "3rem" }}>
      <div className="glass-card" style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
        <h1 className="page-title" style={{ fontSize: "2rem" }}>결제 실패</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
          결제가 완료되지 않았습니다. 결제수단을 확인한 뒤 다시 시도해주세요.
        </p>
        <Link href="/billing" className="btn-primary" style={{ marginTop: "1rem" }}>결제로 돌아가기</Link>
      </div>
    </main>
  );
}
