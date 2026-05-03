"use client";

import Link from "next/link";
import Image from "next/image";
import AuthButtons from "./components/auth/AuthButtons";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes("chrisklee69@gmail.com")) {
    adminEmails.push("chrisklee69@gmail.com");
  }

  const isAdmin =
    !!session?.user?.email &&
    adminEmails.includes(session.user.email.toLowerCase());

  return (
    <main
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "1rem",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <section style={{ textAlign: "center", marginBottom: "0.25rem" }}>
        <h1
          className="page-title"
          style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", marginBottom: "0.4rem" }}
        >
          대치 수프리마 AI 솔루션 플랫폼
        </h1>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.25rem",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Link href="/setuk" style={{ textDecoration: "none" }}>
          <div
            className="glass-card"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "2.4rem 1.6rem",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                background:
                  "radial-gradient(circle at center, rgba(59,130,246,0.35), rgba(37,99,235,0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.4rem",
                border: "1px solid rgba(59,130,246,0.35)",
                boxShadow: "0 12px 26px rgba(29,78,216,0.25)",
              }}
            >
              <span style={{ fontSize: "2.4rem" }}>📝</span>
            </div>
            <div style={{ color: "#3b82f6", fontWeight: 700, marginBottom: "0.35rem" }}>SERVICE 01</div>
            <h2
              style={{
                fontSize: "clamp(1.7rem, 3.6vw, 2.6rem)",
                fontWeight: 800,
                marginBottom: "0.9rem",
                color: "#f8fafc",
              }}
            >
              AI 탐구 세특 솔루션
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.7rem", lineHeight: 1.65 }}>
              학생의 관심사와 진로에 맞춘 심화 탐구 주제를 추천하고,
              전문가 수준의 세특 문장을 자동으로 생성합니다.
            </p>
            <div className="btn-primary" style={{ marginTop: "auto", width: "100%" }}>
              솔루션 시작하기 →
            </div>
          </div>
        </Link>

        <Link href="/diagnosis" style={{ textDecoration: "none" }}>
          <div
            className="glass-card"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "2.4rem 1.6rem",
              background:
                "linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(15,23,42,0.75) 100%)",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "20px",
                background:
                  "radial-gradient(circle at center, rgba(16,185,129,0.32), rgba(5,150,105,0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.4rem",
                border: "1px solid rgba(16,185,129,0.35)",
                boxShadow: "0 12px 26px rgba(16,185,129,0.24)",
              }}
            >
              <span style={{ fontSize: "2.4rem" }}>🎯</span>
            </div>
            <div style={{ color: "#34d399", fontWeight: 700, marginBottom: "0.35rem" }}>SERVICE 02</div>
            <h2
              style={{
                fontSize: "clamp(1.7rem, 3.6vw, 2.6rem)",
                fontWeight: 800,
                marginBottom: "0.9rem",
                color: "#f8fafc",
              }}
            >
              나의 입시 위치 진단
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.7rem", lineHeight: 1.65 }}>
              학생부 분석을 통해 종합 등급을 산출하고,
              2026/2027 대학별 합격 컷과 비교하여 최적의 지원 전략을 제시합니다.
            </p>
            <div
              className="btn-primary"
              style={{
                marginTop: "auto",
                width: "100%",
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              진단 시작하기 →
            </div>
          </div>
        </Link>
      </section>

      <section style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <AuthButtons />
      </section>

      <footer
        className="glass-card"
        style={{ marginTop: "0.5rem", maxWidth: "1100px", width: "100%", marginInline: "auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 300px) 1fr",
            gap: "1.25rem",
            alignItems: "center",
          }}
        >
          <div style={{ justifySelf: "start", width: "100%" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.94)",
                borderRadius: "12px",
                padding: "8px 12px",
                border: "1px solid rgba(148,163,184,0.35)",
                maxWidth: "280px",
              }}
            >
              <Image
                src="/suprema-logo.png"
                alt="대치 수프리마 입시&코칭센터 로고"
                width={280}
                height={92}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>대치수프리마 입시&코칭센터</h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>대표 : 이기욱 대표컨설턴트</p>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>연락처 : 010-2370-1077(문자전송)</p>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>소재지 : 서울시 강남구 테헤란로 326 B1F</p>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              네이버 밴드 : <a href="https://band.us/@suprima" target="_blank" rel="noreferrer">band.us/@suprima</a>
            </p>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              블로그 : <a href="https://blog.naver.com/gouniv_hifive" target="_blank" rel="noreferrer">blog.naver.com/gouniv_hifive</a>
            </p>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              인스타그램 : <a href="https://www.instagram.com/suprima_ipsicreator" target="_blank" rel="noreferrer">suprima_ipsicreator</a>
            </p>
          </div>
        </div>
      </footer>

      {isAdmin && (
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            justifyContent: "flex-end",
            marginTop: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link href="/billing" style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            결제관리
          </Link>
          <span style={{ opacity: 0.5 }}>|</span>
          <Link href="/admin/pricing" style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            관리자설정
          </Link>
        </div>
      )}
    </main>
  );
}



