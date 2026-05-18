"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div style={{ margin: 0, padding: 0, width: "100%", backgroundColor: "#fff", display: "flex", justifyContent: "center" }}>
      
      {/* 새 시안 이미지(template_frame_draft.png) 100% 그대로 적용 */}
      <div style={{ position: "relative", width: "100%", maxWidth: "1150px", margin: 0, padding: 0, lineHeight: 0 }}>
        
        <Image 
          src="/template_frame_draft.png" 
          alt="대치 수프리마 랜딩" 
          width={1150} 
          height={2000} 
          priority
          style={{ width: "100%", height: "auto", display: "block" }}
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
        <Link href="/diagnosis" style={{
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
