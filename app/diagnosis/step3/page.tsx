"use client";

import Link from "next/link";
import FlowShell from "@/app/components/FlowShell";
import AppFooter from "@/app/components/AppFooter";
import Step3 from "./Step3";
import { diagnosisSteps } from "../steps";

export default function DiagnosisStep3Page() {
  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title="탐구활동/독서/세특"
      subtitle="학생부 추출 주제 및 개별 주제로 탐구활동, 독서, 세특문장을 제안합니다."
      currentStep={3}
      steps={diagnosisSteps}
      footer={<AppFooter />}
    >
      <div className="space-y-6">
        <Step3 />
        <div className="flex justify-center gap-3 print:hidden">
          <Link
            href="/diagnosis/step2"
            className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black text-[#3f3f46]"
          >
            이전 단계
          </Link>
          <Link href="/diagnosis/step4" className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white">
            다음 단계로 이동
          </Link>
        </div>
      </div>
    </FlowShell>
  );
}
