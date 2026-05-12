"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Target, Sparkles, Brain, 
  ArrowRight, CheckCircle2, TrendingUp, Users, Quote,
  Phone, MapPin, Clock, Send, MessageCircle
} from 'lucide-react';

export default function SuprimaDigitalBrochure() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 8;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="min-h-screen bg-[#1a233b] flex items-center justify-center p-4 lg:p-10 font-sans antialiased">
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
        body { font-family: 'Pretendard', sans-serif; background-color: #1a233b; }
      `}</style>

      {/* Main Container: Fixed 16:9 Aspect Ratio */}
      <div className="relative w-full max-w-[1400px] aspect-video bg-[#fdfbf7] rounded-[2rem] shadow-2xl overflow-hidden border-8 border-white/5">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {renderSlide(currentSlide)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Overlay */}
        <div className="absolute bottom-8 left-0 w-full px-12 flex justify-between items-center z-50">
          <div className="flex gap-2">
            {[...Array(totalSlides)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? 'w-8 bg-[#8b4513]' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-white hover:shadow-lg transition-all text-[#1a233b]"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextSlide}
              className="px-8 h-12 rounded-full bg-[#8b4513] text-white font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[#8b4513]/20"
            >
              NEXT <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Branding Watermark */}
        <div className="absolute top-8 left-12 flex items-center gap-4 opacity-50">
          <span className="text-xl font-black italic tracking-tighter text-[#1a233b]">대치수프리마 <span className="font-medium opacity-50 ml-2">입시&코칭센터</span></span>
          <div className="h-4 w-px bg-gray-300" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PAGE 0{currentSlide + 1}/0{totalSlides}</span>
        </div>
      </div>
    </div>
  );
}

function renderSlide(index: number) {
  switch (index) {
    case 0: return <SlideCover />;
    case 1: return <SlideProblems />;
    case 2: return <SlideProcess />;
    case 3: return <SlideDifferentiation />;
    case 4: return <SlideComparison />;
    case 5: return <SlidePerformance />;
    case 6: return <SlideShowcase />;
    case 7: return <SlideContact />;
    default: return null;
  }
}

/* SLIDE 01: COVER */
function SlideCover() {
  return (
    <div className="w-full h-full p-20 flex gap-20 items-center">
      <div className="flex-1 space-y-10">
        <div className="space-y-4">
          <div className="bg-[#8b4513] text-white px-4 py-1 text-xs font-black inline-block rounded">SERVICE OVERVIEW</div>
          <h1 className="text-6xl font-black leading-[1.1] text-[#1a233b] tracking-tighter">
            학생부 기반 전략 설계,<br />
            합격까지 <span className="text-[#8b4513]">대치수프리마</span>와 함께
          </h1>
          <p className="text-xl text-gray-500 font-medium leading-relaxed">
            체험이 아닌 열람 중심 스피커입니다.<br />
            서비스 흐름, 보고서 형태, 분석 기능 구성을<br />
            명확히 안내합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-[#1a233b] text-white rounded-xl text-sm font-bold">AI 탐구·세특 솔루션 보기</div>
          <div className="px-6 py-3 bg-[#8b4513] text-white rounded-xl text-sm font-bold">입시 위치 진단 서비스 보기</div>
        </div>
      </div>
      <div className="w-[500px] aspect-[4/5] bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-50 overflow-hidden relative group">
         <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
               <span className="font-black italic">대시보드</span>
               <div className="w-8 h-8 bg-gray-100 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[{l:"지원 가능권",v:"2 상향"}, {l:"추천 탐구 주제",v:"5 건"}, {l:"세특 초안",v:"3 건"}, {l:"분석 변화율",v:"92 %"}].map((d,i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl">
                     <p className="text-[10px] text-gray-400 font-bold mb-1">{d.l}</p>
                     <p className="text-lg font-black text-[#8b4513]">{d.v}</p>
                  </div>
               ))}
            </div>
            <div className="h-40 bg-gray-50 rounded-3xl flex items-center justify-center">
               <TrendingUp className="text-gray-200" size={80} />
            </div>
         </div>
         <div className="absolute inset-0 bg-[#1a233b]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-bold">PREVIEW MODE</span>
         </div>
      </div>
    </div>
  );
}

/* SLIDE 02: PROBLEMS */
function SlideProblems() {
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center gap-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-[#1a233b] tracking-tight">입시, 이런 고민이 있으신가요?</h2>
        <p className="text-gray-400 font-medium text-lg italic">많은 학부모님들과 학생들이 같은 어려움을 겪고 있습니다.</p>
      </div>
      <div className="grid grid-cols-4 gap-8">
        {[
          { i: "01", t: "탐구 주제 선정이 어려워요", s: "진로와 연결된 차별화된 주제를 찾기 힘듭니다." },
          { i: "02", t: "세특 작성에 시간이 부족해요", s: "활동은 많은데 정확한 시간과 방법이 부족합니다." },
          { i: "03", t: "입시 전략이 불투명해요", s: "현재 위치와 목표 대학 간 전략 수립이 막막합니다." },
          { i: "04", t: "정보가 너무 많고 복잡해요", s: "정확한 정보 선별과 분석이 어렵습니다." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-[#fdfbf7] border border-[#8b4513]/20 rounded-2xl flex items-center justify-center text-[#8b4513] font-black">{item.i}</div>
            <div className="space-y-3">
              <h4 className="text-xl font-bold leading-tight">{item.t}</h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.s}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#8b4513]/5 border border-[#8b4513]/10 p-6 rounded-2xl text-center">
         <p className="text-[#8b4513] font-black">대치수프리마는 AI와 전문가의 힘으로 이 모든 고민을 해결합니다.</p>
      </div>
    </div>
  );
}

/* SLIDE 03: PROCESS */
function SlideProcess() {
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center gap-16">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-[#1a233b]">해결 과정</h2>
        <p className="text-gray-400 text-sm font-medium">두 가지 핵심 서비스로 입시 준비의 모든 단계를 지원합니다.</p>
      </div>
      <div className="grid grid-cols-2 gap-20">
        <div className="space-y-8">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Sparkles className="text-[#8b4513]" /> AI 탐구·세특 솔루션
          </h3>
          <div className="flex justify-between relative">
             {[
               { n: "01", t: "관심사·진로 분석" }, { n: "02", t: "맞춤 주제 추천" }, { n: "03", t: "탐구 가이드 제공" }, { n: "04", t: "세특 문장 자동 생성" }
             ].map((s, i) => (
               <div key={i} className="flex flex-col items-center gap-3 z-10">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] font-black">{s.n}</div>
                  <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{s.t}</span>
               </div>
             ))}
             <div className="absolute top-5 left-0 w-full h-px bg-gray-100 -z-10" />
          </div>
        </div>
        <div className="space-y-8">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Brain className="text-[#1a233b]" /> 입시 위치 진단 서비스
          </h3>
          <div className="flex justify-between relative">
             {[
               { n: "01", t: "학생부 분석" }, { n: "02", t: "종합 등급 산출" }, { n: "03", t: "합격 가능성 분석" }, { n: "04", t: "지원 전략 제안" }
             ].map((s, i) => (
               <div key={i} className="flex flex-col items-center gap-3 z-10">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] font-black">{s.n}</div>
                  <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{s.t}</span>
               </div>
             ))}
             <div className="absolute top-5 left-0 w-full h-px bg-gray-100 -z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* SLIDE 04: DIFFERENTIATION */
function SlideDifferentiation() {
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center gap-12">
      <h2 className="text-4xl font-black text-[#1a233b] text-center mb-4">대치수프리마만의 차별점</h2>
      <div className="grid grid-cols-2 gap-8">
        {[
          { t: "교육 데이터 기반 AI", d: "수년간 축적된 입시와 학생부 데이터를 바탕으로 신뢰성 높은 결과를 제공합니다.", i: <Target /> },
          { t: "AI + 전문가 하이브리드", d: "AI 분석과 입시 전문가의 검토를 결합해 실전에서 통하는 방향을 제시합니다.", i: <Users /> },
          { t: "완성도 높은 세특 문장", d: "활동 나열이 아닌 역량과 성과 중심의 설득력 있는 문장을 제공합니다.", i: <CheckCircle2 /> },
          { t: "입시 전략 토탈 케어", d: "탐구 주제 발굴부터 세특 완성, 입시 전략 수립까지 한 번에 관리합니다.", i: <Brain /> }
        ].map((item, i) => (
          <div key={i} className="flex gap-6 p-8 bg-white border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all">
            <div className="w-16 h-16 bg-[#fdfbf7] rounded-2xl flex items-center justify-center text-[#8b4513] shrink-0 shadow-inner">
              {item.i}
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold">{item.t}</h4>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#1a233b] p-6 rounded-2xl text-center text-white/80 font-bold text-sm">
        탐구 주제 발굴부터 세특 완성, 입시 전략 수립까지 하나의 플랫폼에서 경험하세요.
      </div>
    </div>
  );
}

/* SLIDE 05: COMPARISON */
function SlideComparison() {
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center gap-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-[#1a233b]">변화의 시작, 결과는 다릅니다.</h2>
        <p className="text-gray-400 text-sm font-medium">대치수프리마 이용 전후의 변화를 비교해 보세요.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-xl">
        <table className="w-full text-left bg-white">
          <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
             <tr>
               <th className="px-10 py-6">구분</th>
               <th className="px-10 py-6 text-center">기존 방식</th>
               <th className="px-10 py-6 text-center text-[#8b4513]">대치 수프리마 이용 후</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
             {[
               { c: "탐구 주제", b: "유사한 주제 반복, 차별성 부족", a: "진로 연계형 주제로 차별화된 탐구 완성" },
               { c: "세특 문장", b: "활동 나열 중심, 설득력 부족", a: "역량·성과 중심의 완성도 높은 문장" },
               { c: "입시 전략", b: "감에 의존한 지원 전략", a: "데이터 기반 차별 전략 수립" },
               { c: "결과", b: "준비 방향 불명확, 불안감 증가", a: "실행 계획 명확화, 합격 가능성 향상" }
             ].map((row, i) => (
               <tr key={i} className="text-sm">
                  <td className="px-10 py-6 font-bold bg-gray-50/50">{row.c}</td>
                  <td className="px-10 py-6 text-gray-400 text-center">{row.b}</td>
                  <td className="px-10 py-6 font-black text-center text-[#1a233b]">{row.a}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center">
         <div className="flex items-center gap-4 text-[#8b4513]">
            <Quote size={20} className="opacity-30" />
            <p className="text-xl font-black italic">"막막했던 입시 준비가, 실행 가능한 계획으로 바뀝니다."</p>
            <Quote size={20} className="opacity-30 rotate-180" />
         </div>
      </div>
    </div>
  );
}

/* SLIDE 06: PERFORMANCE */
function SlidePerformance() {
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center gap-16">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-[#1a233b]">수치로 증명된 성과</h2>
        <p className="text-gray-400 text-sm font-medium italic">실제 이용 학생과 학부모님의 만족도를 확인하세요.</p>
      </div>
      <div className="grid grid-cols-4 gap-8">
        {[
          { v: "95%", t: "세특 완성도 향상", s: "Sparkles" },
          { v: "93%", t: "탐구 주제 만족도", s: "Target" },
          { v: "92%", t: "입시 전략 정확도", s: "Brain" },
          { v: "98%", t: "재이용 의사", s: "Users" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center gap-6 hover:scale-105 transition-all">
             <div className="text-6xl font-black text-[#8b4513] tracking-tighter">{item.v}</div>
             <div className="text-sm font-bold text-[#1a233b]">{item.t}</div>
             <div className="w-10 h-px bg-gray-100" />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center">* 2024년 12월~2025년 4월 내부 설문 결과 (n=248)</p>
    </div>
  );
}

/* SLIDE 07: SHOWCASE */
function SlideShowcase() {
  return (
    <div className="w-full h-full p-20 flex flex-col justify-center gap-10">
      <h2 className="text-4xl font-black text-[#1a233b] text-center mb-6">서비스 둘러보기 / 보고서 미리보기</h2>
      <div className="relative flex-1 bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden p-10 flex gap-10">
         <div className="w-1/3 h-full bg-gray-50 rounded-2xl flex flex-col p-6 gap-6">
            <div className="h-8 w-1/2 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-4">
               {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 rounded-lg" style={{width: `${100-i*10}%`}} />)}
            </div>
            <div className="h-10 bg-[#8b4513] rounded-xl" />
         </div>
         <div className="flex-1 flex flex-col gap-6">
            <div className="h-32 bg-[#1a233b] rounded-3xl p-8 flex justify-between items-center text-white">
               <div className="space-y-2">
                  <p className="text-[10px] font-bold opacity-50">SUMMARY</p>
                  <p className="text-xl font-black">AI 종합 분석 리포트</p>
               </div>
               <div className="w-16 h-16 bg-white/10 rounded-full border border-white/20" />
            </div>
            <div className="flex-1 grid grid-cols-3 gap-6">
               {[1,2,3].map(i => <div key={i} className="bg-gray-50 rounded-2xl border border-gray-100" />)}
            </div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="text-center">
         <p className="text-xs text-[#8b4513] font-bold">본 화면은 서비스 예시입니다. 실제 결과는 학생 데이터와 분석 조건에 따라 달라질 수 있습니다.</p>
      </div>
    </div>
  );
}

/* SLIDE 08: CONTACT */
function SlideContact() {
  return (
    <div className="w-full h-full p-20 flex gap-20 items-center">
      <div className="flex-1 space-y-12">
        <div className="space-y-6">
          <h2 className="text-5xl font-black text-[#1a233b] tracking-tighter">
            대치수프리마 <br />
            입시&코칭센터
          </h2>
          <p className="text-gray-400 font-medium">학생의 가능성을 발견하고, 최적의 결과로 연결합니다.</p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-[#8b4513]"><Phone size={24}/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Representative</p>
              <p className="text-2xl font-black text-[#8b4513]">02-1234-5678</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-[#1a233b]"><Clock size={24}/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Business Hours</p>
              <p className="text-sm font-bold text-gray-600">평일 10:00 - 22:00 / 토요일 10:00 - 18:00</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-gray-400"><MapPin size={24}/></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</p>
              <p className="text-sm font-bold text-gray-600">서울특별시 강남구 선릉로 428, 6층</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
           {[MessageCircle, MessageCircle, Send, MessageCircle].map((Icon, i) => (
             <div key={i} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#8b4513] hover:text-white transition-all cursor-pointer">
                <Icon size={18} />
             </div>
           ))}
        </div>
      </div>
      
      <div className="w-[500px] aspect-[4/3] bg-gray-200 rounded-[3rem] overflow-hidden shadow-2xl relative border-8 border-white">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#1a233b]/80 to-transparent flex flex-col justify-end p-10 text-white">
            <h3 className="text-2xl font-black">수프리마 입시 센터</h3>
            <p className="text-xs opacity-60">Daechi-dong, Gangnam-gu, Seoul</p>
         </div>
      </div>
    </div>
  );
}
