"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";

interface Props {
  children: ReactNode;
}

export default function AdminOnly({ children }: Props) {
  const { data: session, status } = useSession();
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
  if (!adminEmails.includes("chrisklee69@gmail.com")) {
    adminEmails.push("chrisklee69@gmail.com");
  }

  if (status === "loading") {
    return <p style={{ color: "var(--text-secondary)" }}>권한 확인 중...</p>;
  }

  const email = session?.user?.email?.toLowerCase();
  const isAdmin = !!email && adminEmails.includes(email);

  if (!isAdmin) {
    return (
      <div className="glass-card" style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ marginBottom: "0.75rem" }}>관리자 전용 페이지입니다</h2>
        <p style={{ color: "var(--text-secondary)" }}>관리자 계정으로 로그인된 사용자만 접근할 수 있습니다.</p>
      </div>
    );
  }

  return <>{children}</>;
}
