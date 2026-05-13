import type { Metadata } from "next";
import "./globals.css";
import SessionProviders from "./components/auth/SessionProviders";

export const metadata: Metadata = {
  title: "수프리마 AI 플랫폼",
  description: "입시 위치진단과 AI 학생부 분석을 통합 운영하는 수프리마 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <SessionProviders>{children}</SessionProviders>
      </body>
    </html>
  );
}