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
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      backgroundColor: "#FDFBF7", // 수프리마 시그니처 크림색 배경으로 벙벙함(빈 공간) 완화
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      overflow: "hidden"
    }}>
      
      {/* 
        시안 이미지를 '하나의 프리미엄 웹 소프트웨어 화면' 처럼 감싸주는 액자(Frame) 
        화면이 커져도 정돈된 느낌을 주며 데스크탑 웹 환경에 완벽히 대응함.
      */}
      <div style={{ 
        position: "relative", 
        display: "inline-block", 
        maxWidth: "95vw",  // 가로 여백 확보
        maxHeight: "90vh", // 세로 여백 확보 (스크롤 절대 안 생김)
        backgroundColor: "white",
        borderRadius: "24px", // 부드러운 라운딩 처리
        boxShadow: "0 30px 80px rgba(60, 20, 10, 0.15)", // 고급스러운 깊이감 부여 (핵심)
        overflow: "hidden" // 모서리 밖으로 이미지 튀어나옴 방지
      }}>
        
        <img 
          src="/5_16_IMAGE.png" 
          alt="대치 수프리마 랜딩" 
          style={{ 
            display: "block",
            maxWidth: "100%", 
            maxHeight: "90vh", 
            width: "auto",
            height: "auto",
            objectFit: "contain"
          }}
        />

        {/* 투명한 클릭 영역 1: 센터소개 (우측 상단 텍스트 영역) */}
        <Link href="/intro" style={{
          position: "absolute",
          top: "0",
          right: "0",
          width: "30%",
          height: "15%",
          zIndex: 10,
          cursor: "pointer"
        }} aria-label="센터소개 바로가기" />

        {/* 투명한 클릭 영역 2: 시작하기 (하단 중앙 버튼 영역) */}
        <Link href="/diagnosis/step1" style={{
          position: "absolute",
          bottom: "1%",
          left: "20%",
          width: "60%",
          height: "20%",
          zIndex: 10,
          cursor: "pointer"
        }} aria-label="진단 시작하기" />

      </div>

    </div>
  );
}
