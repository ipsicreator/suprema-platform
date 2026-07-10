"use client";

import type { ReactNode } from "react";

type PrintableReportShellProps = {
  badge: string;
  title: string;
  subtitle: string;
  summary?: ReactNode;
  children: ReactNode;
};

export default function PrintableReportShell({
  badge,
  title,
  subtitle,
  summary,
  children,
}: PrintableReportShellProps) {
  return (
    <section className="hidden print:block">
      <div className="mb-5 rounded-[24px] border border-[#eadfce] bg-white p-6">
        <div className="mb-3 inline-flex rounded-full border border-[#e7d8c4] bg-[#fff8f0] px-3 py-1 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">
          {badge}
        </div>
        <h1 className="text-3xl font-black text-[#1f1720]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        {summary ? <div className="mt-4">{summary}</div> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
