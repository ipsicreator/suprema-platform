"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Cpu, Zap, Sparkles, ChevronLeft, ChevronRight, Share2, Target, Layers } from 'lucide-react';

/**
 * [SUPRIMA PREMIUM BROCHURE - VIBEON CLONE EDITION]
 * 지침: "바이브온 베껴요" - 시각적 감도, 컴포지션, 인터랙션 완벽 복제
 * 규격: 1200x800 하네스 시스템
 */

export default function SuprimaIntroduction() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 8;

  const nextPage = useCallback(() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1)), []);
  const prevPage = useCallback(() => setCurrentPage((prev) => Math.max(prev - 1, 0)), []);

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-0 font-sans overflow-hidden antialiased">
      <style jsx global>{`
        @import url('https://rsms.me/inter/inter.css');
        html { font-family: 'Inter', sans-serif; }
        @supports (font-variation-settings: normal) {
          html { font-family: 'Inter var', sans-serif; }
        }
        .vibeon-glow {
          filter: drop-shadow(0 0 20px rgba(37, 99, 235, 0.4));
        }
        .vibeon-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>

      {/* 1200x800 VIBEON HARNESS */}
      <div className="relative w-[1200px] h-[800px] bg-[#000000] overflow-hidden flex flex-col">
        
        {/* Background Atmosphere: Deep Gradients */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
        </div>

        {/* Vibeon Style Sticky Header */}
        <header className="relative z-50 px-20 py-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center vibeon-glow">
                <span className="text-white font-black text-xl italic font-outfit">S</span>
             </div>
             <span className="text-white font-black text-2xl tracking-tighter uppercase font-outfit">SUPRIMA</span>
          </div>
          <div className="flex items-center gap-10">
             <nav className="flex gap-8 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                <span className="text-blue-500 underline underline-offset-8">Introduction</span>
                <span className="hover:text-white transition-colors cursor-pointer">Logic</span>
                <span className="hover:text-white transition-colors cursor-pointer">Analysis</span>
                <span className="hover:text-white transition-colors cursor-pointer">Result</span>
             </nav>
             <div className="px-6 py-2 bg-white text-black text-[11px] font-black uppercase rounded-full tracking-widest">
                Try for Free
             </div>
          </div>
        </header>

        {/* Main Hero Viewport */}
        <main className="flex-1 relative z-10 px-20 flex items-center">
           <AnimatePresence mode="wait">
              {currentPage === 0 && (
                <motion.div 
                  key="vibeon-p1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex justify-between items-center"
                >
                   {/* Left: Authoritative Text */}
                   <div className="max-w-[650px] space-y-10">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full">
                         <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                         <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">AI Admission Diagnostic v2.0</span>
                      </div>
                      <h1 className="text-[7.5rem] font-black text-white leading-[0.9] tracking-tighter">
                         Beyond The<br />
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400">Human Eye.</span>
                      </h1>
                      <div className="space-y-6">
                         <p className="text-2xl text-white font-medium leading-tight">
                            가르치는 학원에서 <span className="text-blue-600 italic">이끄는 플랫폼</span>으로.
                         </p>
                         <p className="text-lg text-white/40 leading-relaxed max-w-[500px]">
                            수프리마는 단순한 입시 컨설팅을 넘어, 방대한 생기부 데이터를 <br />
                            AI로 정밀 분석하여 대학이 원하는 최적의 합격 로직을 도출합니다.
                         </p>
                      </div>
                      <div className="flex gap-6">
                         <div className="px-10 py-5 bg-blue-600 rounded-2xl text-white font-black text-lg flex items-center gap-3 shadow-2xl shadow-blue-600/40">
                            시작하기 <ChevronRight size={20} />
                         </div>
                         <div className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-white/60 font-black text-lg">
                            기술 설명서
                         </div>
                      </div>
                   </div>

                   {/* Right: Vibeon-Style Floating Visual Nodes */}
                   <div className="relative w-[500px] h-[500px]">
                      {/* Central Node */}
                      <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 vibeon-glass rounded-[4rem] p-10 flex flex-col justify-between shadow-2xl z-20"
                      >
                         <Cpu className="text-blue-500" size={40} />
                         <div className="space-y-2">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Main Engine</p>
                            <p className="text-white text-4xl font-black font-outfit leading-none">SUPRIMA AI</p>
                         </div>
                         <div className="h-px w-full bg-blue-500/30" />
                         <div className="flex justify-between items-center">
                            <Activity size={20} className="text-blue-500" />
                            <span className="text-blue-500 text-[10px] font-black uppercase">Scanning...</span>
                         </div>
                      </motion.div>

                      {/* Floating Data Cards */}
                      <motion.div 
                        initial={{ opacity: 0, x: 50, y: -50 }}
                        animate={{ opacity: 1, x: 30, y: -180, rotate: -5 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="absolute top-1/2 left-1/2 w-48 p-6 vibeon-glass rounded-3xl z-30"
                      >
                         <div className="flex items-center gap-3 mb-4">
                            <Target size={18} className="text-blue-400" />
                            <span className="text-white/60 text-[10px] font-bold uppercase">Accuracy</span>
                         </div>
                         <p className="text-white text-3xl font-black font-outfit">99.8%</p>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, x: -150, y: 100 }}
                        animate={{ opacity: 1, x: -240, y: 80, rotate: 5 }}
                        transition={{ delay: 0.7, duration: 1 }}
                        className="absolute top-1/2 left-1/2 w-56 p-8 vibeon-glass rounded-[2.5rem] z-10"
                      >
                         <div className="flex items-center gap-3 mb-4">
                            <Layers size={20} className="text-indigo-400" />
                            <span className="text-white/60 text-[10px] font-bold uppercase">Data Density</span>
                         </div>
                         <div className="flex items-end gap-1">
                            {[10, 20, 15, 30, 25, 40].map((h, i) => (
                              <div key={i} className="flex-1 bg-indigo-500/40 rounded-full" style={{ height: h }} />
                            ))}
                         </div>
                      </motion.div>

                      {/* Ambient Connection Lines (SVG) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                         <motion.path 
                           d="M 250 250 L 350 150 M 250 250 L 150 350" 
                           stroke="white" 
                           strokeWidth="1" 
                           fill="none" 
                           strokeDasharray="5 5"
                           animate={{ strokeDashoffset: [0, -20] }}
                           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         />
                      </svg>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </main>

        {/* Pagination & Global Mark */}
        <footer className="relative z-50 px-20 py-12 flex justify-between items-end">
           <div className="space-y-6">
              <div className="flex gap-2">
                 {[...Array(totalPages)].map((_, i) => (
                   <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === currentPage ? 'w-16 bg-blue-600' : 'w-2 bg-white/10'}`} />
                 ))}
              </div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">2026 Suprima Intelligence Architecture</p>
           </div>
           <Share2 size={24} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
        </footer>
      </div>
    </div>
  );
}
