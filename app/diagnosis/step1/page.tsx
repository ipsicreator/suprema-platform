"use client";

import { useRouter } from "next/navigation";
import FlowShell from "@/app/components/FlowShell";
import AppFooter from "@/app/components/AppFooter";
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
      title="학생정보입력"
      subtitle="학생정보와 학생부를 정확하게 입력해 주세요."
      currentStep={1}
      steps={diagnosisSteps}
      footer={<AppFooter />}
    >
      <Step1 onNext={handleNext} />
    </FlowShell>
  );
}
