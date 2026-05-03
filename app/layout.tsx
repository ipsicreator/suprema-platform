import type { Metadata } from "next";
import "./globals.css";
import SessionProviders from "./components/auth/SessionProviders";

export const metadata: Metadata = {
  title: "수프리마 AI 솔루션 플랫폼",
  description: "입시위치진단과 AI 세특 서비스를 통합 운영하는 플랫폼",
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
