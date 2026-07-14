import type { FlowStep } from "@/app/components/FlowShell";

export const diagnosisSteps: FlowStep[] = [
  {
    no: "1",
    title: "학생정보입력",
    description: "사용자 정보를 입력하고 학생부 PDF를 등록합니다.",
  },
  {
    no: "2",
    title: "학생부 분석",
    description: "학생부 상세 분석 결과를 리포트 형태로 보여줍니다.",
  },
  {
    no: "3",
    title: "전공주제 / 세특 / 탐구",
    description: "학생부에서 추출한 주제와 추가 주제를 함께 보여줍니다.",
  },
  {
    no: "4",
    title: "입시 위치 진단",
    description: "학생부 기반으로 대학별 진단 결과를 보여줍니다.",
  },
];
