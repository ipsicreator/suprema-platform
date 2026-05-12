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
      <body style={{ userSelect: 'auto', WebkitUserSelect: 'auto' } as any}>
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            var style = document.createElement('style');
            style.innerHTML = '* { user-select: auto !important; -webkit-user-select: auto !important; }';
            document.head.appendChild(style);
            
            var handler = function(e) { e.stopPropagation(); };
            document.addEventListener('copy', handler, true);
            document.addEventListener('paste', handler, true);
            document.addEventListener('contextmenu', handler, true);
            document.addEventListener('selectstart', handler, true);
          })();
        ` }} />
        <SessionProviders>{children}</SessionProviders>
      </body>
    </html>
  );
}
