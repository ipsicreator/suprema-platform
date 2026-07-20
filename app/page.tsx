"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  // 스크롤 완벽 차단
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#FDFBF7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          maxWidth: "95vw",
          maxHeight: "90vh",
          backgroundColor: "white",
          borderRadius: "24px",
          boxShadow: "0 30px 80px rgba(60, 20, 10, 0.15)",
          overflow: "hidden",
        }}
      >
        <img
          src="/5_16_IMAGE.png"
          alt="대치 수프리마 랜딩"
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
          }}
        />

        <Link
          href="/intro"
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "30%",
            height: "15%",
            zIndex: 10,
            cursor: "pointer",
          }}
          aria-label="센터소개 바로가기"
        />

        <Link
          href="/diagnosis"
          style={{
            position: "absolute",
            bottom: "1%",
            left: "20%",
            width: "60%",
            height: "20%",
            zIndex: 10,
            cursor: "pointer",
          }}
          aria-label="진단 시작하기"
        />
      </div>
    </div>
  );
}
