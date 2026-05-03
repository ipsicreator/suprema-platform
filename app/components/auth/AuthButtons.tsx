"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

const providers = [
  { id: "google", label: "구글로 시작하기", icon: "/auth/google.svg", bg: "#0b1220" },
  { id: "naver", label: "네이버로 시작하기", icon: "/auth/naver.svg", bg: "#0b1220" },
  { id: "kakao", label: "카카오로 시작하기", icon: "/auth/kakao.svg", bg: "#0b1220" },
];

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return <p style={{ color: "var(--text-secondary)" }}>로그인 상태 확인 중...</p>;
  }

  if (session?.user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>
          로그인됨: {session.user.name || session.user.email || "사용자"}
        </p>
        <button className="btn-primary" type="button" onClick={() => signOut()}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "0.75rem",
        justifyContent: "center",
        maxWidth: "1020px",
        margin: "0 auto",
      }}
    >
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => signIn(provider.id)}
          aria-label={provider.label}
          style={{
            minHeight: "62px",
            borderRadius: "14px",
            border: "1px solid rgba(71,85,105,0.55)",
            background: provider.bg,
            color: "#f8fafc",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0 1rem",
            boxShadow: "0 10px 22px rgba(2,6,23,0.24)",
            cursor: "pointer",
            fontSize: "1.05rem",
            fontWeight: 700,
          }}
        >
          <Image src={provider.icon} alt={provider.label} width={30} height={30} />
          <span>{provider.label}</span>
        </button>
      ))}
    </div>
  );
}
