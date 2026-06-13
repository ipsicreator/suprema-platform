"use client";

import { useRouter } from "next/navigation";
import { Brain, FileCheck2, FileSearch, UserRound } from "lucide-react";
import FlowShell from "@/app/components/FlowShell";
import Step1 from "./Step1";
import { UserInfo } from "../../components/UserInfoForm";

export default function DiagnosisStep1Page() {
  const router = useRouter();

  const handleNext = (info: UserInfo) => {
    try {
      sessionStorage.setItem("suprema_user_info", JSON.stringify(info));
    } catch {}
    router.push("/diagnosis/step1/evaluation");
  };

  return (
    <FlowShell
      badge="AI 학생부/성적분석 · 탐구/독서 제안"
      title="학생부/성적분석"
      subtitle="개인 사용자 정보 입력 → 학생부/성적분석 → 탐구/독서 제안 → 입시위치 진단까지 같은 화면 톤으로 연결합니다."
      steps={[
        { no: "01", title: "사용자 정보 입력", description: "학생·학교·진로 정보를 먼저 등록합니다.", icon: <UserRound className="h-5 w-5" /> },
        { no: "02", title: "학생부 등록", description: "PDF, 이미지 PDF, 이미지 파일을 모두 처리합니다.", icon: <FileSearch className="h-5 w-5" /> },
        { no: "03", title: "학생부/성적분석", description: "과목/등급/학년 흐름을 시각화합니다.", icon: <Brain className="h-5 w-5" /> },
        { no: "04", title: "탐구/독서 제안", description: "탐구 주제와 보고서 단계로 이어집니다.", icon: <FileCheck2 className="h-5 w-5" /> },
      ]}
    >
      <Step1 onNext={handleNext} />
    </FlowShell>
  );
}
