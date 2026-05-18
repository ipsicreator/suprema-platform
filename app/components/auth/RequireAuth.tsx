"use client";

import { signIn, useSession } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function RequireAuth({ children }: Props) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p style={{ color: "var(--text-secondary)" }}>로그인 상태 확인 중...</p>;
  }

  if (!session?.user) {
    return (
      <div className="v-card" style={{ maxWidth: "540px", margin: "40px auto", textAlign: "center", padding: "60px" }}>
        <div className="v-badge">ACCESS RESTRICTED</div>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "16px" }}>로그인이 필요합니다</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "15px" }}>
          AI 탐구 브레인 서비스를 이용하시려면<br />
          먼저 소셜 로그인을 통해 본인 인증을 진행해 주세요.
        </p>
        <button className="v-btn-primary" style={{ padding: "14px 40px", fontSize: "16px" }} onClick={() => signIn()}>
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
