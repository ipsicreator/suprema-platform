"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div style={{ margin: 0, padding: 0, width: "100%", backgroundColor: "#fff", display: "flex", justifyContent: "center" }}>
      
      {/* 원본 이미지 100% 그대로 적용 (어떠한 디자인 훼손도 없음) */}
      <div style={{ position: "relative", width: "100%", maxWidth: "1150px", margin: 0, padding: 0, lineHeight: 0 }}>
        
        <Image 
          src="/5_16_IMAGE.png" 
          alt="대치 수프리마 랜딩" 
          width={1150} 
          height={2000} 
          priority
          style={{ width: "100%", height: "auto", display: "block" }}
        />

        {/* 투명한 클릭 영역 1: 센터소개 (우측 상단 넓게) */}
        <Link href="/intro" style={{
          position: "absolute",
          top: "0",
          right: "0",
          width: "40%",
          height: "15%",
          zIndex: 10,
          cursor: "pointer"
        }} aria-label="센터소개 (8P) 바로가기" />

        {/* 투명한 클릭 영역 2: 시작하기 (하단 중앙 넓게) */}
        <Link href="/diagnosis" style={{
          position: "absolute",
          bottom: "0",
          left: "10%",
          width: "80%",
          height: "20%",
          zIndex: 10,
          cursor: "pointer"
        }} aria-label="진단 시작하기" />

      </div>

    </div>
  );
}
