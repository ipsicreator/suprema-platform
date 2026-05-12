"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Minus, Download, ArrowRight } from "lucide-react";

export default function ReportPage() {
  // Mock data for 3-year history (2023, 2024, 2025)
  const reportData = {
    student: {
      name: "홍길동",
      grade: "고3 (9등급제)",
      score: "1.95",
      type: "인문계열",
    },
    analysis: [
      {
        university: "성균관대학교",
        major: "사회과학계열",
        method: "학교장추천 (교과)",
        history: {
          y2023: "1.82",
          y2024: "1.88",
          y2025: "1.92",
        },
        status: "적정",
        trend: "up", // up, down, steady
        remark: "3개년 입결이 완만하게 상승 중이나, 2025 컷 대비 학생 점수가 경쟁력 있음.",
      },
      {
        university: "중앙대학교",
        major: "심리학과",
        method: "지역균형 (교과)",
        history: {
          y2023: "2.10",
          y2024: "1.95",
          y2025: "1.85",
        },
        status: "도전",
        trend: "up",
        remark: "합격선이 급격히 상승 중인 학과임. 2025 컷 대비 다소 부족하므로 서류 보완 필수.",
      },
      {
        university: "경희대학교",
        major: "정치외교학과",
        method: "네오르네상스 (종합)",
        history: {
          y2023: "2.25",
          y2024: "2.15",
          y2025: "2.20",
        },
        status: "안정",
        trend: "steady",
        remark: "최근 3개년 박스권 입결 유지. 현재 점수로 안정적인 합격권 판단.",
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 pt-24 px-6 pb-20">
      <div className="max-w-6xl mx-auto min-w-0">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">3개년 입결 추이 분석 리포트</h1>
            <p className="text-slate-400 text-sm">실제 입학 결과(2023-2025)를 바탕으로 분석한 정밀 리포트입니다.</p>
          </div>
          <button className="btn-primary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> 리포트 저장
          </button>
        </div>

        {/* Student Info Bar */}
        <div className="glass p-6 rounded-2xl border border-white/5 mb-8 flex flex-wrap gap-8 items-center">
          <div><span className="text-slate-500 text-xs block mb-1">학생명</span><span className="font-bold">{reportData.student.name}</span></div>
          <div className="w-px h-8 bg-white/10" />
          <div><span className="text-slate-500 text-xs block mb-1">내신 지표</span><span className="font-bold text-sky-400">{reportData.student.score}</span></div>
          <div className="w-px h-8 bg-white/10" />
          <div><span className="text-slate-500 text-xs block mb-1">대상 학년</span><span className="font-bold">{reportData.student.grade}</span></div>
        </div>

        {/* 3-Year Comparison Table */}
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-5">대학 / 전형</th>
                <th className="px-4 py-5 text-center">2023 실결</th>
                <th className="px-4 py-5 text-center">2024 실결</th>
                <th className="px-4 py-5 text-center bg-sky-500/5 text-sky-400">2025 실결</th>
                <th className="px-4 py-5 text-center">추이</th>
                <th className="px-6 py-5">판정 및 소견</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reportData.analysis.map((item, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-6 min-w-0">
                    <p className="font-bold mb-1 break-keep [overflow-wrap:anywhere]">{item.university}</p>
                    <p className="text-[11px] text-slate-500 break-keep [overflow-wrap:anywhere]">{item.method} | {item.major}</p>
                  </td>
                  <td className="px-4 py-6 text-center font-mono text-sm text-slate-400">{item.history.y2023}</td>
                  <td className="px-4 py-6 text-center font-mono text-sm text-slate-400">{item.history.y2024}</td>
                  <td className="px-4 py-6 text-center font-mono text-sm font-bold text-sky-400 bg-sky-500/5">{item.history.y2025}</td>
                  <td className="px-4 py-6 text-center">
                    {item.trend === 'up' ? <TrendingUp className="w-4 h-4 text-rose-500 mx-auto" /> : 
                     item.trend === 'down' ? <TrendingDown className="w-4 h-4 text-sky-500 mx-auto" /> : 
                     <Minus className="w-4 h-4 text-slate-500 mx-auto" />
                    }
                  </td>
                  <td className="px-6 py-6 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === '안정' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === '적정' ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs break-keep [overflow-wrap:anywhere]">{item.remark}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend / Info */}
        <div className="mt-6 flex gap-6 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-rose-500" /> 합격선 상승 (경쟁 심화)</div>
          <div className="flex items-center gap-1.5"><TrendingDown className="w-3 h-3 text-sky-500" /> 합격선 하락 (기회 구간)</div>
          <div className="flex items-center gap-1.5"><Minus className="w-3 h-3 text-slate-500" /> 보합세 유지</div>
        </div>
      </div>
    </div>
  );
}
