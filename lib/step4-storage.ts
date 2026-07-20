type Judgment = "하향" | "안정" | "도전" | "불가";

type UniversityTargetLike = {
  id: string;
  judgment: Judgment;
  [key: string]: unknown;
};

export function summarizeJudgments(targets: Array<Pick<UniversityTargetLike, "judgment">>) {
  const count = targets.reduce<Record<Judgment, number>>(
    (acc, target) => {
      acc[target.judgment] += 1;
      return acc;
    },
    { 하향: 0, 안정: 0, 도전: 0, 불가: 0 },
  );

  return `하향 ${count.하향} · 안정 ${count.안정} · 도전 ${count.도전} · 불가 ${count.불가}`;
}

export function createNextUniversityTarget(nextIndex: number) {
  return {
    id: `target-${nextIndex}`,
    university: "희망대학 입력",
    department: "모집단위 입력",
    trackType: "전형유형 선택",
    admissionName: "전형명 입력",
    judgment: "안정" as const,
    reason: "학생이 직접 선택한 희망대학을 학생부 기준으로 진단합니다.",
  };
}

export function buildStep4SessionPayload<T extends UniversityTargetLike>(payload: {
  email: string;
  openId: string;
  targets: T[];
}) {
  return {
    email: payload.email,
    openId: payload.openId,
    targets: payload.targets,
  };
}
