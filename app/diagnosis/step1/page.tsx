"use client";

import { useRouter } from "next/navigation";
import FlowShell from "@/app/components/FlowShell";
import Step1 from "./Step1";
import { diagnosisSteps } from "../steps";
import { UserInfo } from "../../components/UserInfoForm";

export default function DiagnosisStep1Page() {
  const router = useRouter();

  const handleNext = (info: UserInfo) => {
    try {
      sessionStorage.setItem("suprema_user_info", JSON.stringify(info));
    } catch {}
    router.push("/diagnosis/step2");
  };

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title="진단정보입력"
      subtitle="정밀한 진단과 리포트 발송을 위해 모든 정보를 정확히 입력해주세요."
      currentStep={1}
      steps={diagnosisSteps}
    >
      <Step1 onNext={handleNext} />
    </FlowShell>
  );
}
