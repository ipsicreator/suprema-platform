"use client";

import Image from "next/image";

export default function IntroPage() {
  const totalPages = 8;
  const pages = Array.from({ length: totalPages }, (_, i) => `/FINAL_1_8_PAGES/0${i + 1}.png`);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#fff", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      padding: "0",
      margin: "0"
    }}>
      
      {/* 어떠한 상단 헤더, 로고, 그림자 흔적도 없이 오직 원본 이미지 8장만 100% 렌더링 */}
      <div style={{
        width: "100%",
        maxWidth: "1150px",
        display: "flex",
        flexDirection: "column",
        gap: "0", // 이미지 간격도 없애서 하나의 긴 통이미지처럼 매끄럽게 연결
        padding: "0"
      }}>
        {pages.map((imgSrc, index) => (
          <Image 
            key={index}
            src={imgSrc} 
            alt={`센터소개 ${index + 1}페이지`} 
            width={1150} 
            height={1600} 
            priority={index < 2} // 처음 2장만 우선 로딩
            style={{ width: "100%", height: "auto", display: "block", margin: 0, padding: 0 }}
          />
        ))}
      </div>

    </div>
  );
}
