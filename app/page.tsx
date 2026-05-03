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
    <main className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.94)",
              borderRadius: "14px",
              padding: "10px 14px",
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "0 10px 30px rgba(2,6,23,0.28)",
              maxWidth: "min(560px, 94vw)",
            }}
          >
            <Image
              src="/suprema-logo.png"
              alt="대치 수프리마 입시&코칭센터 로고"
              width={540}
              height={170}
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </div>
        </div>
        <p style={{ color: "var(--accent)", marginBottom: "0.75rem", fontWeight: 700 }}>SUPREMA INTEGRATION PORTAL</p>
        <h1 className="page-title" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
          대치 수프리마 AI 솔루션 플랫폼
        </h1>
        <p className="page-subtitle" style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          한 번의 사용자 정보 입력으로 2개 서비스를 연동하고, 통합 운영 및 결제까지 확장하는 입시 플랫폼입니다.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <AuthButtons />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Service 1 Card */}
        <Link href="/setuk" style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "20px", 
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem",
              border: "1px solid rgba(59, 130, 246, 0.3)"
            }}>
              <span style={{ fontSize: "2.5rem" }}>📝</span>
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "1rem", color: "#f8fafc" }}>
              AI 탐구 세특 솔루션
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              학생의 관심사와 진로에 맞춘 심화 탐구 주제를 추천하고, 전문가 수준의 세특 문장을 자동으로 생성합니다.
            </p>
            <div className="btn-primary" style={{ marginTop: "auto", width: "100%" }}>
              솔루션 시작하기 &rarr;
            </div>
          </div>
        </Link>

        {/* Service 2 Card */}
        <Link href="/diagnosis" style={{ textDecoration: "none" }}>
          <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "20px", 
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem",
              border: "1px solid rgba(16, 185, 129, 0.3)"
            }}>
              <span style={{ fontSize: "2.5rem" }}>🎯</span>
            </div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "1rem", color: "#f8fafc" }}>
              나의 입시 위치 진단
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              학생부 분석을 통해 종합 등급을 산출하고, 2026/2027 대학별 합격 컷과 비교하여 최적의 지원 전략을 수립합니다.
            </p>
            <div className="btn-primary" style={{ marginTop: "auto", width: "100%", background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}>
              진단 시작하기 &rarr;
            </div>
          </div>
        </Link>

      </div>

      <div className="glass-card" style={{ marginTop: "2rem", maxWidth: "1000px", width: "100%", marginInline: "auto" }}>
        <h3 style={{ marginBottom: "1rem" }}>통합 운영 로드맵</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
          <li>사용자 정보 1회 입력 후 세특/입시진단 공통 사용</li>
          <li>서비스별 결과를 한 계정에서 조회하는 통합 대시보드</li>
          <li>결제/구독(패키지형) 연계를 위한 결제 모듈 확장</li>
        </ul>
      </div>

      <div className="glass-card" style={{ marginTop: "1rem", maxWidth: "1000px", width: "100%", marginInline: "auto" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>대치수프리마 입시&코칭센터</h3>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>대표 : 이기욱 대표컨설턴트</p>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>연락처 : 010-2370-1077 (문자전송)</p>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>소재지 : 서울시 강남구 테헤란로 326 B1F</p>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          네이버 밴드 : <a href="https://band.us/@suprima" target="_blank" rel="noreferrer">band.us/@suprima</a>
        </p>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          인스타그램 : <a href="https://www.instagram.com/chrisklee_kr/" target="_blank" rel="noreferrer">chrisklee_kr</a>
        </p>
      </div>

      {isAdmin && (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/billing" style={{ fontSize: "0.8rem", opacity: 0.8 }}>결제관리</Link>
          <span style={{ opacity: 0.5 }}>·</span>
          <Link href="/admin/pricing" style={{ fontSize: "0.8rem", opacity: 0.8 }}>관리자설정</Link>
        </div>
      )}
    </main>
  );
}
