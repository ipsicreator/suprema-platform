import { NextResponse } from "next/server";
import { recommendTopics } from "@/lib/topicRecommender";

type RequestBody = {
  subject?: string;
  keywords?: string[];
  careerHint?: string;
  targetGoal?: string;
  count?: number;
};

function normalizeSubject(subject?: string) {
  const value = subject?.trim();
  if (!value) return "과학탐구";
  if (value === "과학" || value.includes("과학")) return "과학탐구";
  if (value === "사회" || value.includes("사회")) return "사회탐구";
  if (value.includes("정보") || value.toUpperCase().includes("IT")) return "정보(IT)";
  return value;
}

function buildSetukSentence(topic: { title: string; direction: string; conclusion_seed: string }, keywords: string[]) {
  const keyText = keywords.filter(Boolean).slice(0, 3).join(", ") || "학생부 핵심 역량";
  return `${keyText}을 바탕으로 '${topic.title}' 주제를 설정하고, ${topic.direction} 탐구를 수행해 자료 수집과 분석 과정을 통해 ${topic.conclusion_seed}라는 결론을 도출하며 교과 개념을 진로 관련 분야로 확장해 나간다.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const subject = normalizeSubject(body.subject);
    const keywords = Array.isArray(body.keywords) ? body.keywords.map(String).filter(Boolean).slice(0, 6) : [subject];
    const count = Math.min(Math.max(Number(body.count || 3), 1), 3);

    const topics = recommendTopics(subject, keywords, body.careerHint || "", body.targetGoal || "", "high", count).map(
      (topic, index) => ({
        id: `${subject}-${index + 1}`,
        subject,
        keyword: keywords[index] || keywords[0] || subject,
        topic_title: topic.title,
        topic_direction: topic.direction,
        books: topic.books,
        papers: topic.papers,
        data_sources: topic.data_sources,
        expected_conclusion: topic.conclusion_seed,
        setuk_sentence: buildSetukSentence(topic, keywords),
        tip: topic.tip || "",
      }),
    );

    return NextResponse.json({ topics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "탐구 주제 생성 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
