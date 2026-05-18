import type { FullChoice, FullDimension, FullQuestion } from "./fullQuestions";
import { FULL_QUESTIONS_24 } from "./fullQuestions";

export type FullAnswers = Record<string, FullChoice>;

export type DimensionScore = Record<FullDimension, number>; // 0..100 (higher = higher risk)

export type FullProfile = {
  dimensionScore: DimensionScore;
  topBottlenecks: Array<{ dimension: FullDimension; score: number }>;
  summary: string;
  next2Weeks: string[];
  consultNeed: "low" | "medium" | "high";
};

const DIMENSIONS: FullDimension[] = [
  "reading",
  "representation",
  "inference",
  "verification",
  "organization",
  "stamina",
  "exploration",
];

const defaultScore: DimensionScore = {
  reading: 0,
  representation: 0,
  inference: 0,
  verification: 0,
  organization: 0,
  stamina: 0,
  exploration: 0,
};

function choiceRiskDefault(choice: FullChoice): number {
  // Heuristic: A is often stable, C is often risk, B/D are in-between.
  if (choice === "A") return 0;
  if (choice === "B") return 1;
  if (choice === "C") return 2;
  return 1;
}

const OVERRIDES: Record<string, Record<FullChoice, number>> = {
  // Specific questions where mapping differs
  F07: { A: 0, B: 1, C: 3, D: 0 }, // 검산: 거의 안함 = high risk
  F09: { A: 0, B: 1, C: 3, D: 2 }, // 오답 정리 없음/느림
  F11: { A: 0, B: 2, C: 3, D: 1 }, // 후반 집중 급락이 더 위험
  F15: { A: 0, B: 1, C: 3, D: 2 }, // 읽기 전에 착수 자주
  F17: { A: 0, B: 2, C: 1, D: 3 }, // 마지막에 손 놓음
  F21: { A: 0, B: 1, C: 2, D: 3 }, // 한 장 정리 경험 없음
  F24: { A: 0, B: 1, C: 3, D: 2 }, // 실수 방지 장치 없음
};

function getRisk(questionId: string, choice: FullChoice): number {
  const override = OVERRIDES[questionId];
  if (override) return override[choice];
  return choiceRiskDefault(choice);
}

function normalizeTo100(raw: number, max: number): number {
  if (max <= 0) return 0;
  const v = Math.round((raw / max) * 100);
  return Math.max(0, Math.min(100, v));
}

function consultNeedFromTop(top: Array<{ dimension: FullDimension; score: number }>): FullProfile["consultNeed"] {
  const highest = top[0]?.score ?? 0;
  if (highest >= 70) return "high";
  if (highest >= 45) return "medium";
  return "low";
}

export function buildFullProfile(answers: FullAnswers): FullProfile {
  const sum: Record<FullDimension, number> = { ...defaultScore };
  const count: Record<FullDimension, number> = { ...defaultScore };

  for (const q of FULL_QUESTIONS_24) {
    const picked = answers[q.id];
    if (!picked) continue;
    const r = getRisk(q.id, picked);
    sum[q.dimension] += r;
    count[q.dimension] += 1;
  }

  const dimensionScore: DimensionScore = { ...defaultScore };
  for (const d of DIMENSIONS) {
    // Each item max risk is 3
    const max = (count[d] || 0) * 3;
    dimensionScore[d] = normalizeTo100(sum[d], max);
  }

  const topBottlenecks = [...DIMENSIONS]
    .map((d) => ({ dimension: d, score: dimensionScore[d] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const consultNeed = consultNeedFromTop(topBottlenecks);

  const labels: Record<FullDimension, string> = {
    reading: "읽기/조건 해석",
    representation: "표상 전환(그림·표·식)",
    inference: "추론/식화",
    verification: "검산/실수 방지",
    organization: "정리/기록/서술",
    stamina: "지속/페이스/번아웃",
    exploration: "탐구/질문/확장",
  };

  const summary = `현재 병목 상위: ${topBottlenecks
    .map((t) => `${labels[t.dimension]}(${t.score})`)
    .join(", ")}.`;

  const next2Weeks: string[] = [];
  for (const t of topBottlenecks.slice(0, 2)) {
    if (t.dimension === "verification") next2Weeks.push("검산을 ‘필수 루틴’으로 고정(중간 1회 + 마지막 1회).");
    if (t.dimension === "reading") next2Weeks.push("문장제는 30초 내 ‘조건 표시→표상’까지 착수 루틴 고정.");
    if (t.dimension === "representation") next2Weeks.push("표상 전환(그림↔표↔식) 10분/일, 정답보다 전환 성공률.");
    if (t.dimension === "organization") next2Weeks.push("서술형 3줄 템플릿(조건→식/그림→결론)로 기록 고정.");
    if (t.dimension === "stamina") next2Weeks.push("훈련을 ‘짧게-자주’로 분할 + 주 1회 회복일 고정.");
    if (t.dimension === "inference") next2Weeks.push("풀이 압축: 한 줄 요약 + 핵심식 1개만 남기기.");
    if (t.dimension === "exploration") next2Weeks.push("탐구는 질문 1개 + 가설 1개로 제한하고 결과는 5문장 요약.");
  }

  if (next2Weeks.length === 0) next2Weeks.push("가장 자주 흔들리는 상황(시험/숙제/수행)을 먼저 정하고 루틴을 고정하세요.");

  return { dimensionScore, topBottlenecks, summary, next2Weeks, consultNeed };
}

