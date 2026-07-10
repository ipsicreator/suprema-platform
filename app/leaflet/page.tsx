"use client";

import Link from "next/link";
import { ArrowRight, Award, Brain, Download, Search, Target, TrendingUp, Zap } from "lucide-react";

export default function LeafletPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl space-y-24 px-6 py-16 md:px-10">
        <section className="grid gap-10 border-b-4 border-sky-500 pb-16 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded bg-sky-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Official Service Guide
            </div>
            <h1 className="text-5xl font-black leading-none tracking-tight md:text-6xl">
              Suprima
              <br />
              <span className="text-sky-500">Admission</span>
              <br />
              Strategy
            </h1>
            <p className="text-lg leading-8 text-slate-500">
              학생부를 기반으로 입시 진단, 탐구·세특 제안, 희망대학 매칭까지 한 흐름으로 안내합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/diagnosis" className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">
                입시위치진단 보기
              </Link>
              <Link href="/exploration" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-700">
                탐구·세특 보기
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-slate-200 bg-slate-50 p-8 shadow-inner">
            <h2 className="text-2xl font-black tracking-tight">핵심 요약</h2>
            <p className="mt-3 leading-7 text-slate-600">
              학생부 분석 결과, 탐구 주제, 희망대학 판단을 시각적으로 묶어 보여주는 안내 페이지입니다.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: <Target className="h-5 w-5" />, title: "입시위치진단", desc: "하향 · 안정 · 도전 · 불가 판정" },
                { icon: <Brain className="h-5 w-5" />, title: "탐구·세특", desc: "주제별 문장 제안" },
                { icon: <TrendingUp className="h-5 w-5" />, title: "학생부 분석", desc: "원문과 요약 비교" },
                { icon: <Award className="h-5 w-5" />, title: "최종 결과", desc: "인쇄와 메일 발송" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sky-600">
                    {item.icon}
                    <span className="text-sm font-black text-slate-900">{item.title}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight">정밀 입시위치진단</h2>
            <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-sky-500" />
            <p className="mt-4 text-slate-500">학생부 기반 합격 가능성과 보완 포인트를 함께 확인합니다.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "3개년 추이",
                desc: "2023-2025학년도 기준으로 성적 추이를 확인합니다.",
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "기준 비교",
                desc: "컷 기준과 학생부 결과를 비교해 판정을 제시합니다.",
              },
              {
                icon: <Search className="h-8 w-8" />,
                title: "희망대학 검색",
                desc: "사용자가 직접 선택한 희망대학을 기준으로 진단합니다.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
                <div className="text-sky-500">{item.icon}</div>
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight">AI 탐구·세특 제안</h2>
            <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-indigo-500" />
            <p className="mt-4 text-slate-500">학생부 키워드와 전공 적합성을 연결해 주제를 제안합니다.</p>
          </div>
          <div className="rounded-[3rem] bg-indigo-600 p-8 text-white shadow-2xl md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em]">
                  <Zap className="h-4 w-4 text-amber-300" />
                  AI Recommendation
                </div>
                <h3 className="text-3xl font-black leading-tight">탐구 주제, 독서, 세특 문장을 한 번에 정리합니다.</h3>
                <ul className="space-y-3 text-sm leading-6 text-white/90">
                  <li>학생부 추출 키워드를 기반으로 기본 주제 3개를 먼저 보여줍니다.</li>
                  <li>사용자 주제 추가 검색으로 최대 3개를 더 확장합니다.</li>
                  <li>총 6개 주제를 인쇄와 메일로 한 번에 전달합니다.</li>
                </ul>
              </div>
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Result</p>
                <p className="mt-2 text-2xl font-black">탐구·세특·입시위치진단</p>
                <p className="mt-3 text-sm leading-7 text-white/85">
                  학생부 분석 결과와 연결된 주제, 문장, 대학 판단을 하나의 결과로 묶어 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-200 bg-slate-50 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">바로가기</h2>
              <p className="mt-2 text-sm text-slate-500">주요 화면으로 빠르게 이동합니다.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/diagnosis/step1" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white">
                학생정보입력 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/diagnosis/step4" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-700">
                입시위치진단 <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white">
                <Download className="h-4 w-4" /> 인쇄
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
