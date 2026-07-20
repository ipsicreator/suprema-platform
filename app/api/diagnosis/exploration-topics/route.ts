import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ExplorationTopicsRequest = {
  subject?: string;
  keywords?: string[];
  careerHint?: string;
  count?: number;
};

type TopicResult = {
  id: string;
  subject: string;
  keyword: string;
  topic_title: string;
  topic_direction: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  expected_conclusion: string;
  setuk_sentence: string;
  tip?: string;
};

function normalizeSubject(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || "과학";
}

function normalizeKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 3);
}

function buildTopic(subject: string, keyword: string, careerHint: string, index: number): TopicResult {
  const seed = keyword || careerHint || subject;
  const topicPool: Omit<TopicResult, "id" | "subject" | "keyword">[] = [
    {
      topic_title: `${seed} 관련 변인 비교 탐구`,
      topic_direction: `조건을 2~3개로 나누어 ${seed}의 변화 양상을 비교하고, 결과를 표와 그래프로 정리합니다.`,
      books: [`${seed} 개념서`, `${careerHint || subject} 관련 도서`],
      papers: [`${seed} 탐구 사례`, `${subject} 관련 논문`],
      data_sources: ["학교 수업 자료", "공공 데이터", "관찰 기록"],
      expected_conclusion: `${seed}의 조건 차이가 결과에 미치는 영향을 해석할 수 있습니다.`,
      setuk_sentence: `${careerHint || subject} 관심을 바탕으로 ${seed} 관련 변인을 비교 탐구하고, 수집한 자료를 근거로 해석하는 태도를 보임.`,
      tip: "탐구 변인을 한 개만 명확히 잡는 것이 좋습니다.",
    },
    {
      topic_title: `${seed}와 실제 사례의 연결 분석`,
      topic_direction: `교과 개념과 생활 속 사례를 연결해 ${seed}의 적용 가능성을 분석합니다.`,
      books: [`${subject} 교과서`, `${seed} 사례집`],
      papers: [`${seed} 적용 연구`, `${careerHint || subject} 관련 보고서`],
      data_sources: ["인터뷰", "기사 자료", "공개 통계"],
      expected_conclusion: `교과 개념이 실제 사례에서 어떻게 활용되는지 설명할 수 있습니다.`,
      setuk_sentence: `${careerHint || subject} 진로와 연결해 ${seed}의 실제 사례를 분석하고, 개념을 적용해 해석하는 역량을 드러냄.`,
      tip: "사례 1개보다 2개 이상 비교하면 좋습니다.",
    },
    {
      topic_title: `${seed} 개선 방안 제안 탐구`,
      topic_direction: `문제 상황을 정의하고 자료를 바탕으로 ${seed} 개선 방안을 제안합니다.`,
      books: [`${subject} 문제 해결 자료`, `${careerHint || subject} 확장 도서`],
      papers: [`${seed} 개선 연구`, `${subject} 정책 자료`],
      data_sources: ["설문", "관찰", "공공자료"],
      expected_conclusion: `${seed}의 문제 원인과 개선 방향을 논리적으로 제시할 수 있습니다.`,
      setuk_sentence: `${careerHint || subject} 관점에서 ${seed} 개선 방안을 탐구하고, 자료 기반으로 대안을 제시하는 태도를 보임.`,
      tip: "개선 방안은 실행 가능성까지 포함해야 합니다.",
    },
  ];

  const item = topicPool[index % topicPool.length];
  return {
    id: `topic-${index + 1}`,
    subject,
    keyword: seed,
    ...item,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplorationTopicsRequest;
    const subject = normalizeSubject(body.subject);
    const keywords = normalizeKeywords(body.keywords);
    const careerHint = String(body.careerHint ?? subject).trim() || subject;
    const count = Math.max(1, Math.min(3, Number(body.count ?? 3) || 3));

    const topics = Array.from({ length: count }, (_, index) => buildTopic(subject, keywords[index] || keywords[0] || subject, careerHint, index));

    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ error: "Failed to generate exploration topics" }, { status: 500 });
  }
}
