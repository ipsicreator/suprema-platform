import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "수프리마 AI 솔루션 플랫폼",
  description: "수프리마 입시&코칭 센터 전용 AI 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
