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

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function svgDataUri(lines: string[], width = 1200, height = 220) {
  const text = lines
    .map((line, index) => {
      const y = 70 + index * 54;
      return `<text x="50%" y="${y}" text-anchor="middle" font-family="Arial, Pretendard, sans-serif" font-size="${index === 0 ? 44 : 24}" font-weight="700" fill="#1a0f08">${escapeXml(line)}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/>${text}</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function StepTextImage({ text, width = 260, height = 26, size = 18 }: { text: string; width?: number; height?: number; size?: number }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white" opacity="0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Pretendard, sans-serif" font-size="${size}" font-weight="700" fill="#1f1720">${escapeXml(text)}</text></svg>`;
  return <img src={`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`} alt={text} style={{ display: "block", width: "100%", height: "auto" }} />;
}

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
            <Image src="/suprema-logo.png" alt="수프리마 로고" width={160} height={48} priority className="h-11 w-auto object-contain" />
          </Link>
          <div className="pt-2 text-left leading-tight text-[#1a0f08]" spellCheck={false}>
            <div className="text-[15px] font-black tracking-[-0.03em]">수프리마 입시멘토</div>
            <div className="text-[22px] font-black tracking-[-0.02em]">탐구·세특·입시위치진단</div>
          </div>
          <div className="justify-self-end pt-2 text-[11px] font-bold uppercase tracking-[0.34em] text-[#a7adb8]">{badge}</div>
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
                      <div className={["relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold", active ? "border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-[0_8px_18px_rgba(139,26,26,0.18)]" : "border-[#eadfce] bg-white text-[#9ca3af]"].join(" ")}>
                        {step.no}
                      </div>
                      <div className={`mt-3 w-full ${active ? "opacity-100" : "opacity-90"}`}>
                        <StepTextImage text={step.title} width={220} height={26} size={17} />
                      </div>
                      {step.description ? (
                        <div className="mt-1 w-full opacity-85">
                          <StepTextImage text={step.description} width={280} height={44} size={11} />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        <section className="px-6 pt-8 text-center md:px-8 md:pt-10">
          <img src={svgDataUri([title, subtitle], 1200, 220)} alt={title} style={{ width: "100%", height: "auto", display: "block" }} />
        </section>

        <section className="px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">{children}</section>
        {footer ? <div className="border-t border-[#ece0d1] px-6 py-6 md:px-8">{footer}</div> : null}
      </div>
    </main>
  );
}
