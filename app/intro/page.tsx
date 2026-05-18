"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function IntroPage() {
  const totalPages = 8;
  const pages = Array.from({ length: totalPages }, (_, i) => `/FINAL_1_8_PAGES/0${i + 1}.png`);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--suprima-cream, #FDFBF7)", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      padding: "0"
    }}>
      
      {/* Sticky Navigation Header */}
      <div style={{
        position: "sticky",
        top: 0,
        width: "100%",
        backgroundColor: "rgba(253, 251, 247, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #ECE0D1",
        zIndex: 50,
        display: "flex",
        justifyContent: "center"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1150px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px"
        }}>
          <Link href="/" style={{
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            color: "#1a0f08", 
            fontWeight: "900", 
            fontSize: "16px",
            textDecoration: "none"
          }}>
            <ArrowLeft size={20} /> 첫 화면으로
          </Link>
          <div style={{ fontSize: "14px", fontWeight: "800", color: "#A13E17", letterSpacing: "0.1em" }}>
            대치 수프리마 통합 브로슈어
          </div>
        </div>
      </div>

      {/* 8 Pages Viewer Container */}
      <div style={{
        width: "100%",
        maxWidth: "1150px",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        padding: "40px 0 120px 0"
      }}>
        {pages.map((imgSrc, index) => (
          <div key={index} style={{
            width: "100%",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(44, 26, 10, 0.08)",
            backgroundColor: "white"
          }}>
            <Image 
              src={imgSrc} 
              alt={`센터소개 ${index + 1}페이지`} 
              width={1150} 
              height={1600} 
              priority={index < 2} // Preload first 2 pages
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
