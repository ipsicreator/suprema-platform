import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type FlowStep = {
  no: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

type FlowShellProps = {
  badge?: string;
  title: string;
  subtitle: string;
  steps?: FlowStep[];
  currentStep?: number;
  footer?: ReactNode;
  children: ReactNode;
};

export default function FlowShell({
  badge = "PREMIUM DIAGNOSIS",
  title,
  subtitle,
  steps = [],
  currentStep = 1,
  footer,
  children,
}: FlowShellProps) {
  return (
    <main style={{ minHeight: "100vh", background: "#f7f4ee", padding: "16px", color: "#1a0f08" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", overflow: "hidden", borderRadius: 32, border: "1px solid #eadfce", background: "#fff", boxShadow: "0 28px 90px rgba(44,26,10,0.08)" }}>
        <header style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "start", gap: 16, padding: "24px 32px 0" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image src="/suprema-logo.png" alt="수프리마 입시코칭센터" width={160} height={48} priority style={{ height: 44, width: "auto" }} />
          </Link>
          <div style={{ paddingTop: 8, textAlign: "left", lineHeight: 1.15 }}>
            <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.03em" }}>수프리마 입시코칭센터</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>학생부·탐구·입시위치진단</div>
          </div>
          <div style={{ justifySelf: "end", paddingTop: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.34em", color: "#a7adb8" }}>
            {badge}
          </div>
        </header>
        {steps.length ? (
          <section style={{ padding: "24px 32px 0" }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
              {steps.map((step, index) => {
                const active = index + 1 === currentStep;
                return (
                  <div key={step.no} style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, margin: "0 auto", borderRadius: 999, border: `2px solid ${active ? "#8b1a1a" : "#eadfce"}`, background: active ? "#8b1a1a" : "#fff", color: active ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                      {step.no}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: active ? "#8b1a1a" : "#6f7480" }}>{step.title}</div>
                    {step.description ? <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.6, color: "#9ca3af" }}>{step.description}</div> : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
        <section style={{ padding: "32px 32px 0", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, letterSpacing: "-0.06em" }}>{title}</h1>
          <p style={{ margin: "16px auto 0", maxWidth: 900, fontSize: 16, fontWeight: 600, lineHeight: 1.8, color: "#5f5549" }}>{subtitle}</p>
        </section>
        <section style={{ padding: "32px 32px 24px" }}>{children}</section>
        {footer ? <div style={{ borderTop: "1px solid #ece0d1", padding: "24px 32px" }}>{footer}</div> : null}
      </div>
    </main>
  );
}
