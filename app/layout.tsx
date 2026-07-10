import type { Metadata } from "next";
import "./globals.css";
import SessionProviders from "./components/auth/SessionProviders";

export const metadata: Metadata = {
  title: "나의 입시멘토 | 탐구·세특·입시위치진단",
  description: "탐구·세특·입시위치진단을 하나의 흐름으로 제공하는 나의 입시멘토 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>
        <SessionProviders>{children}</SessionProviders>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const allowEvent = (e) => e.stopImmediatePropagation();
                document.addEventListener('copy', allowEvent, true);
                document.addEventListener('cut', allowEvent, true);
                document.addEventListener('paste', allowEvent, true);
                document.addEventListener('contextmenu', allowEvent, true);
                document.addEventListener('selectstart', allowEvent, true);
                document.addEventListener('mousedown', (e) => {
                  if (e.detail > 1) e.preventDefault();
                }, true);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
