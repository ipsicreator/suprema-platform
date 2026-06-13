"use client";

import Image from "next/image";

export default function IntroPage() {
  const totalPages = 8;
  const pages = Array.from({ length: totalPages }, (_, index) => `/suprima_16x9_final_8/0${index + 1}.png`);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", margin: 0, padding: 0 }}>
      <div style={{ width: "100%", maxWidth: "1150px", margin: "0 auto", padding: "24px 0 0" }}>
        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #eadfce" }}>
          <div
            style={{
              display: "inline-flex",
              borderRadius: "999px",
              background: "#8b1a1a0f",
              color: "#8b1a1a",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.2em",
              padding: "6px 12px",
            }}
          >
            센터소개
          </div>
          <h1 style={{ marginTop: "16px", fontSize: "44px", lineHeight: 1.1, fontWeight: 900, color: "#1a0f08" }}>
            수프리마 플랫폼
          </h1>
          <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "16px", fontWeight: 500 }}>
            8장 소개 페이지를 순서대로 확인할 수 있도록 구성했습니다.
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0, padding: 0 }}>
          {pages.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`센터소개 ${index + 1}페이지`}
              width={1150}
              height={1600}
              priority={index < 2}
              style={{ width: "100%", height: "auto", display: "block", margin: 0, padding: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
