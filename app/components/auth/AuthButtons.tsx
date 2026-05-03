"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const providers = [
  { id: "google", label: "Google 로그인" },
  { id: "naver", label: "Naver 로그인" },
  { id: "kakao", label: "Kakao 로그인" },
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
      {providers.map((provider) => (
        <button key={provider.id} className="btn-primary" type="button" onClick={() => signIn(provider.id)}>
          {provider.label}
        </button>
      ))}
    </div>
  );
}
