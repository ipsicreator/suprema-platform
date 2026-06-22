import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export type FlowStep = {
  no: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

type FlowShellProps = {
  badge?: string;
  title: string;
  subtitle: string;
  steps?: FlowStep[];
  currentStep?: number;
  footer?: ReactNode;
  children: ReactNode;
};

export default function FlowShell({
  badge = "PREMIUM DIAGNOSIS",
  title,
  subtitle,
  steps = [],
  currentStep = 1,
  footer,
  children,
}: FlowShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-4 text-[#1a0f08] md:px-6 md:py-6">
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[32px] border border-[#eadfce] bg-white shadow-[0_28px_90px_rgba(44,26,10,0.08)]">
        <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 px-6 pt-6 md:px-8 md:pt-7">
          <Link href="/" className="shrink-0">
            <Image
              src="/suprema-logo.png"
              alt="대치 수프리마"
              width={160}
              height={48}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>
          <div className="pt-2 text-left leading-tight text-[#1a0f08]" spellCheck={false}>
            <div className="text-[15px] font-black tracking-[-0.03em]">나의 입시멘토</div>
            <div className="text-[22px] font-black tracking-[-0.02em]">탐구·세특·입시위치진단</div>
          </div>
          <div className="justify-self-end pt-2 text-[11px] font-bold uppercase tracking-[0.34em] text-[#a7adb8]">
            {badge}
          </div>
        </header>

        {steps.length ? (
          <section className="px-6 pt-6 md:px-8 md:pt-7">
            <div className="relative">
              <div className="absolute left-[5%] right-[5%] top-[20px] h-px bg-[#eadfce]" />
              <ol className={`relative grid gap-3 ${steps.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                {steps.map((step, index) => {
                  const active = index + 1 === currentStep;
                  return (
                    <li key={step.no} className="flex flex-col items-center text-center">
                      <div
                        className={[
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold",
                          active
                            ? "border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-[0_8px_18px_rgba(139,26,26,0.18)]"
                            : "border-[#eadfce] bg-white text-[#9ca3af]",
                        ].join(" ")}
                      >
                        {step.no}
                      </div>
                      <span className={`mt-3 text-sm font-semibold ${active ? "text-[#8b1a1a]" : "text-[#6f7480]"}`}>
                        {step.title}
                      </span>
                      {step.description ? (
                        <span className="mt-1 max-w-[13rem] text-[11px] leading-5 text-[#9ca3af]">
                          {step.description}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        <section className="px-6 pt-8 text-center md:px-8 md:pt-10">
          <h1 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.06em] text-[#1a0f08]">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-[15px] font-semibold leading-7 text-[#5f5549] md:text-[16px]">
            {subtitle}
          </p>
        </section>

        <section className="px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">{children}</section>

        {footer ? <div className="border-t border-[#ece0d1] px-6 py-6 md:px-8">{footer}</div> : null}
      </div>
    </main>
  );
}
