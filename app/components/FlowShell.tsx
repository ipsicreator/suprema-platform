import Link from "next/link";
import type { ReactNode } from "react";

export type FlowStep = {
  no: string;
  title: string;
  description: string;
  icon: ReactNode;
};

type FlowShellProps = {
  badge: string;
  title: string;
  subtitle: string;
  steps?: FlowStep[];
  footer?: ReactNode;
  children: ReactNode;
};

export default function FlowShell({ badge, title, subtitle, steps, footer, children }: FlowShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f5f1] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-[#eadfce] bg-white p-5 shadow-[0_24px_70px_rgba(44,26,10,0.08)] md:p-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-[#ece0d1] pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-[#8b1a1a]/5 px-3 py-1 text-xs font-extrabold tracking-[0.2em] text-[#8b1a1a]">
              {badge}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#1a0f08] md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm font-medium text-slate-500 md:text-base">{subtitle}</p>
          </div>
          <Link href="/diagnosis/step1" className="rounded-full border border-[#d7c8b8] bg-[#faf6f0] px-4 py-3 text-sm font-bold text-slate-700">
            학생부 다시 입력
          </Link>
        </div>

        {steps?.length ? (
          <section className="rounded-[28px] border border-[#ece0d1] bg-[#fffdf9] p-5 shadow-[0_18px_44px_rgba(44,26,10,0.05)] md:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-[#1a0f08]">진행 단계</h2>
              <span className="rounded-full border border-[#e4d7c9] bg-white px-3 py-1 text-xs font-bold text-[#8b1a1a]">
                {steps.length} STEP
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.no} className="rounded-[24px] border border-[#ece0d1] bg-white p-5 shadow-[0_10px_26px_rgba(44,26,10,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#efe5d8] bg-[#f8f5f1] text-[#1a0f08]">
                      {step.icon}
                    </div>
                    <div className="rounded-full border border-[#eadfce] bg-[#fff8f0] px-3 py-1 text-sm font-black text-[#8b1a1a]">
                      {step.no}
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-[#1a0f08]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </main>
  );
}
