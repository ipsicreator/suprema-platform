import type { FlowStep } from "@/app/components/FlowShell";

export const diagnosisSteps: FlowStep[] = [
  {
    no: "1",
    title: "학생정보입력",
    description: "사용자정보 입력과 학생부를 등록/진단합니다.",
  },
  {
    no: "2",
    title: "학생부 분석",
    description: "학생부 상세 분석결과를 리포트로 제공합니다.",
  },
  {
    no: "3",
    title: "탐구활동/독서/세특",
    description: "학생부 추출 주제와 개별 주제로 탐구활동, 독서, 세특문장을 제안합니다.",
  },
  {
    no: "4",
    title: "입시위치 진단",
    description: "내신성적과 학생부 기반으로 희망대학 매칭 진단 및 결과를 제시합니다.",
  },
];

export const diagnosisScreenText = {
  step1: {
    title: "학생정보입력",
    subtitle: "정밀한 진단과 리포트 발송을 위해 모든 정보를 정확하게 입력해 주세요.",
  },
  step2: {
    title: "학생부 분석",
    subtitle: "학생부 상세 분석결과를 리포트로 제공합니다.",
  },
  step4: {
    title: "입시위치 진단",
    subtitle: "내신성적과 학생부 기반으로 희망대학 매칭 진단 및 결과를 제시합니다.",
  },
} as const;
