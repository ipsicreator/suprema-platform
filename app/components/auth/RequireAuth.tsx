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
      <div className="glass-card" style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ marginBottom: "0.75rem" }}>로그인이 필요합니다</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
          2개 서비스를 연동 사용하려면 먼저 SNS 로그인을 진행해주세요.
        </p>
        <button className="btn-primary" type="button" onClick={() => signIn()}>
          로그인하러 가기
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
