"use client";

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

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
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 70% 32%, rgba(18, 68, 102, 0.24), transparent 28%), radial-gradient(circle at 18% 42%, rgba(21, 78, 142, 0.20), transparent 34%), linear-gradient(180deg, #06152a 0%, #020a15 55%, #071426 100%)",
        color: "#fff",
        padding: "24px 12px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1366px",
          margin: "0 auto",
          border: "1px solid rgba(216, 167, 94, 0.28)",
          borderRadius: "14px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.42)",
          padding: "20px 24px 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: "10px 22px",
            borderRadius: 8,
            border: "1px solid rgba(218, 173, 110, .55)",
            background: "rgba(7,18,35,.56)",
            color: "#f3eadf",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          센터 소개
        </button>

        <section style={{ textAlign: "center", paddingTop: 56 }}>
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              background: "linear-gradient(180deg, #d9d4cd 0%, #cbc5bd 100%)",
              border: "2px solid #e4bd82",
              borderRadius: 18,
              boxShadow: "0 0 0 4px rgba(255,255,255,.24) inset, 0 14px 32px rgba(0,0,0,.34)",
              padding: "28px 18px",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#050a11",
                fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: 900,
                letterSpacing: "-0.06em",
                lineHeight: 1.1,
              }}
            >
              수프리마 AI 솔루션 플랫폼
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                color: "#111",
                fontSize: "clamp(1.1rem, 2.2vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              Su·Prima 입시&코칭 센터
            </p>
          </div>

          <p style={{ margin: "24px 0 18px", fontSize: "clamp(1rem, 2vw, 2rem)", fontWeight: 700 }}>
            입시의 본질을 분석하고, 최적의 전략으로 합격을 설계합니다.
          </p>

          <div
            style={{
              maxWidth: 980,
              margin: "0 auto 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            <button onClick={() => signIn("google")} style={loginBtnStyle}>
              <span style={{ color: "#4285f4", fontWeight: 900, fontSize: 28 }}>G</span> 구글로 시작하기
            </button>
            <button onClick={() => signIn("naver")} style={loginBtnStyle}>
              <span style={{ color: "#03c75a", fontWeight: 900, fontSize: 28 }}>N</span> 네이버로 시작하기
            </button>
            <button onClick={() => signIn("kakao")} style={loginBtnStyle}>
              <span style={{ color: "#ffd43b", fontWeight: 900, fontSize: 28 }}>●</span> 카카오로 시작하기
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
              maxWidth: 1240,
              margin: "0 auto",
            }}
          >
            <article style={cardBlue}>
              <div style={{ color: "#2e93ff", fontWeight: 900 }}>SERVICE 01</div>
              <h2 style={cardTitle}>AI 탐구 세특 솔루션</h2>
              <p style={cardDesc}>
                학생의 관심사와 진로에 맞춘 심화 탐구 주제를 추천하고,
                전문가 수준의 세특 문장을 자동으로 생성합니다.
              </p>
              <Link href="/setuk" style={ctaBlue as React.CSSProperties}>솔루션 시작하기 →</Link>
            </article>

            <article style={cardGreen}>
              <div style={{ color: "#20e0a6", fontWeight: 900 }}>SERVICE 02</div>
              <h2 style={cardTitle}>나의 입시 위치 진단</h2>
              <p style={cardDesc}>
                학생부 분석을 통해 종합 등급을 산출하고,
                대학별 합격 컷과 비교하여 최적의 지원 전략을 제시합니다.
              </p>
              <Link href="/diagnosis" style={ctaGreen as React.CSSProperties}>진단 시작하기 →</Link>
            </article>
          </div>
        </section>

        <footer
          style={{
            marginTop: 22,
            borderTop: "1px solid rgba(255,255,255,.12)",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <Image src="/suprema-logo.png" alt="수프리마 로고" width={250} height={96} style={{ width: "250px", height: "auto" }} />
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.20)", paddingLeft: 18 }}>
              <p style={footLine}>대표 : 이기욱 대표컨설턴트</p>
              <p style={footLine}>연락처 : 010-2370-1077(문자전송)</p>
              <p style={footLine}>소재지 : 서울시 강남구 테헤란로 326 B1F</p>
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,.20)", paddingLeft: 18 }}>
              <p style={footLine}>네이버 밴드 : band.us/@suprima</p>
              <p style={footLine}>블로그 : https://blog.naver.com/gouniv_hifive</p>
              <p style={footLine}>인스타그램 : suprima_ipsicreator</p>
            </div>
          </div>
          <p style={{ textAlign: "center", opacity: 0.75, marginTop: 18 }}>© 2025 Su·Prima 입시&코칭센터. All rights reserved.</p>
        </footer>

        {isAdmin && (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.75rem" }}>
            <Link href="/billing" style={{ fontSize: "0.8rem", opacity: 0.8 }}>결제관리</Link>
            <span style={{ opacity: 0.5 }}>|</span>
            <Link href="/admin/pricing" style={{ fontSize: "0.8rem", opacity: 0.8 }}>관리자설정</Link>
          </div>
        )}
      </div>
    </main>
  );
}

const loginBtnStyle: CSSProperties = {
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  border: "1px solid rgba(211, 150, 83, .45)",
  borderRadius: 10,
  background: "rgba(9, 22, 43, .82)",
  color: "#fff",
  fontSize: 18,
  fontWeight: 800,
};

const cardBlue: CSSProperties = {
  borderRadius: 18,
  padding: "30px",
  border: "1px solid rgba(62,135,255,.55)",
  background: "linear-gradient(135deg, rgba(7, 25, 57, .98), rgba(4, 12, 28, .96))",
  textAlign: "left",
};

const cardGreen: CSSProperties = {
  borderRadius: 18,
  padding: "30px",
  border: "1px solid rgba(24, 178, 125, .55)",
  background: "linear-gradient(135deg, rgba(4, 48, 43, .98), rgba(2, 27, 27, .96))",
  textAlign: "left",
};

const cardTitle: CSSProperties = {
  margin: "10px 0 12px",
  fontSize: "clamp(2rem, 3vw, 3rem)",
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const cardDesc: CSSProperties = {
  margin: "0 0 20px",
  color: "#d7dfed",
  fontSize: 16,
  lineHeight: 1.7,
};

const ctaBlue = {
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: 9,
  border: "1px solid #2e93ff",
  color: "#3ba2ff",
  textDecoration: "none",
  fontWeight: 800,
};

const ctaGreen = {
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: 9,
  border: "1px solid #13b985",
  color: "#20e0a6",
  textDecoration: "none",
  fontWeight: 800,
};

const footLine: CSSProperties = {
  margin: "8px 0",
  color: "#ecf0f7",
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "-0.02em",
};
