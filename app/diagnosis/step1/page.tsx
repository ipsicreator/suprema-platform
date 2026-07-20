"use client";

import { useRouter } from "next/navigation";
import FlowShell from "@/app/components/FlowShell";
import Step1 from "./Step1";
import { diagnosisScreenText, diagnosisSteps } from "../content";
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
      title={diagnosisScreenText.step1.title}
      subtitle={diagnosisScreenText.step1.subtitle}
      currentStep={1}
      steps={diagnosisSteps}
    >
      <Step1 onNext={handleNext} />
    </FlowShell>
  );
}

