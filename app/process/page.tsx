"use client";

import Link from "next/link";
import AppFooter from "@/app/components/AppFooter";

const steps = [
  {
    no: "01",
    title: "학생정보 입력",
    description: "학생명, 학교, 학년, 연락처, 이메일을 넣고 학생부 PDF를 올립니다.",
  },
  {
    no: "02",
    title: "학생부 분석",
    description: "과목별 원점수, 평균, 성취도, 비교 분석, 메모, 인쇄, 메일 보내기를 확인합니다.",
  },
  {
    no: "03",
    title: "전공주제 / 세특 / 탐구",
    description: "기본 3개 주제와 추가 3개 주제, 책, 자료, 세특 문장을 함께 봅니다.",
  },
  {
    no: "04",
    title: "입시 위치 진단",
    description: "희망대학별 판단 결과, 근거, 1~3단계 묶음, 메일 보내기를 확인합니다.",
  },
];

export default function ProcessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f4ee",
        color: "#1a0f08",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          overflow: "hidden",
          borderRadius: 32,
          border: "1px solid #eadfce",
          background: "#fff",
          boxShadow: "0 28px 90px rgba(44,26,10,0.08)",
        }}
      >
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "start",
            gap: 16,
            padding: "24px 32px 0",
          }}
        >
          <div />
          <div style={{ paddingTop: 8, textAlign: "left", lineHeight: 1.15 }}>
            <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.03em" }}>수프리마 랩</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>탐구 · 세특 · 입시위치진단</div>
          </div>
          <div
            style={{
              justifySelf: "end",
              paddingTop: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.34em",
              color: "#a7adb8",
            }}
          >
            PREMIUM DIAGNOSIS
          </div>
        </header>

        <section style={{ padding: "32px 32px 12px", textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, letterSpacing: "-0.06em" }}>
            전체 흐름
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: 900, fontSize: 16, fontWeight: 600, lineHeight: 1.8, color: "#5f5549" }}>
            학생정보 입력부터 학생부 분석, 탐구 제안, 입시 위치 진단까지 한 흐름으로 이어집니다.
            각 단계는 결과 화면, 인쇄, 메일 보내기까지 바로 연결됩니다.
          </p>
        </section>

        <section style={{ padding: "32px 32px 24px" }}>
          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            }}
          >
            {steps.map((step) => (
              <section
                key={step.no}
                style={{
                  borderRadius: 24,
                  border: "1px solid #eadfce",
                  background: "#fffdf8",
                  padding: 20,
                  boxShadow: "0 14px 34px rgba(59,35,12,0.05)",
                }}
              >
                <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 900, letterSpacing: "0.16em", color: "#8b1a1a" }}>
                  {step.no}
                </div>
                <h2 style={{ margin: "0 0 12px", fontSize: 21, fontWeight: 900, color: "#1f1720" }}>{step.title}</h2>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.7, color: "#6b7280" }}>
                  {step.description}
                </p>
              </section>
            ))}
          </div>

          <div
            style={{
              marginTop: 24,
              borderRadius: 24,
              border: "1px solid #eadfce",
              background: "#fffaf4",
              padding: 20,
            }}
          >
            <div style={{ marginBottom: 10, fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", color: "#8b1a1a" }}>
              RESULT CHECK
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
              <MiniResult title="1단계" text="학생부 PDF 업로드와 기본 정보 확인" />
              <MiniResult title="2단계" text="학생부 원문, 요약 분석, 메일 / 인쇄" />
              <MiniResult title="3단계" text="탐구 주제, 책, 자료, 세특 문장" />
              <MiniResult title="4단계" text="희망대학 판단, 근거, 최종 결과 발송" />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <ActionLink href="/diagnosis/step1" primary>
              학생정보 입력
            </ActionLink>
            <ActionLink href="/diagnosis/step1/evaluation">학생부 분석 결과</ActionLink>
            <ActionLink href="/exploration">탐구 / 독서 / 세특 제안</ActionLink>
            <ActionLink href="/diagnosis">입시 위치 진단</ActionLink>
            <ActionLink href="/report">최종 결과 페이지</ActionLink>
          </div>
        </section>

        <div style={{ borderTop: "1px solid #ece0d1", padding: "24px 32px" }}>
          <AppFooter />
        </div>
      </div>
    </main>
  );
}

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        border: `1px solid ${primary ? "#8b1a1a" : "#d9c8b3"}`,
        background: primary ? "#8b1a1a" : "#f4ede3",
        color: primary ? "#fff" : "#3f3f46",
        padding: "16px 20px",
        fontSize: 14,
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

function MiniResult({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid #e7dac6",
        background: "#fff",
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 900, color: "#8b1a1a" }}>{title}</div>
      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6, color: "#4b5563" }}>{text}</div>
    </div>
  );
}
