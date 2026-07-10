"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const fallbackKeywords = ["구조 안정성", "에너지 설계", "도시 환경"];
const subjectOptions = ["국어", "영어", "수학", "사회탐구", "과학탐구", "정보(IT)"];
const initialBaseTopics: TopicResult[] = [
  {
    id: "initial-1",
    subject: "과학탐구",
    keyword: "구조 안정성",
    topic_title: "태양광 모듈 각도와 기울기가 발전 효율에 미치는 영향",
    topic_direction: "태양광 모듈의 각도와 기울기 조건을 비교하여 발전 효율 변화를 분석합니다.",
    books: ["친환경 에너지", "태양광 발전의 이해"],
    papers: ["태양광 발전 효율 최적화 연구", "모듈 성능 분석"],
    data_sources: ["한국에너지공단 데이터", "공공데이터포털", "기상청 일사량 데이터"],
    expected_conclusion: "기울기와 방위각 조합에 따른 발전 효율 차이를 정량적으로 제시합니다.",
    setuk_sentence:
      "구조 안정성과 에너지 설계 관심을 바탕으로 태양광 모듈의 기울기와 각도에 따른 효율 차이를 비교 분석하고, 실험 설계와 자료 해석 역량을 보여줌.",
  },
  {
    id: "initial-2",
    subject: "과학탐구",
    keyword: "에너지 설계",
    topic_title: "교실 CO2 농도와 학생 집중도의 상관 분석",
    topic_direction: "교실 내 CO2 농도를 측정하고 집중도와의 관계를 데이터로 비교합니다.",
    books: ["실내 환경과 데이터 분석", "환경과학 개론"],
    papers: ["실내 공기질과 학습 성과의 관계", "CO2 농도 연구"],
    data_sources: ["환경부 대기질 데이터", "공공데이터포털", "센서 측정 데이터"],
    expected_conclusion: "교실 공기질 변화가 학습 환경에 미치는 영향을 설명합니다.",
    setuk_sentence:
      "에너지 설계와 환경 데이터 분석에 대한 관심을 바탕으로 교실 CO2 농도와 집중도의 상관관계를 분석하고, 측정값과 설문 결과를 연결해 개선 방향을 도출함.",
  },
  {
    id: "initial-3",
    subject: "과학탐구",
    keyword: "도시 환경",
    topic_title: "미세먼지 성분과 건물 외장재 종류별 오염 지수 비교",
    topic_direction: "외장재 종류별 표면 오염도와 유지 시간을 측정해 차이를 비교합니다.",
    books: ["화학과 생활", "도시 환경과 오염"],
    papers: ["외장재 오염도와 화학적 분석", "도시 미세먼지 연구"],
    data_sources: ["환경통계정보서비스", "제품 성분 정보", "실험 측정 데이터"],
    expected_conclusion: "표면 특성과 외장재 조합에 따른 오염 지수 차이를 분석합니다.",
    setuk_sentence:
      "도시 환경 문제에 대한 관심을 확장하여 미세먼지 성분과 외장재 종류별 오염 지수를 비교하고, 측정 결과를 근거로 해석하는 탐구 태도를 보여줌.",
  },
];

function normalizeSubject(value: unknown) {
  const text = typeof value === "string" ? value : "";
  if (subjectOptions.includes(text)) return text;
  if (text.includes("사회")) return "사회탐구";
  if (text.includes("정보") || text.toLowerCase().includes("it")) return "정보(IT)";
  return "과학탐구";
}

function readUserContext() {
  try {
    const raw = sessionStorage.getItem("suprema_user_info");
    if (!raw) {
      return { keywords: fallbackKeywords, subject: "과학탐구", careerHint: "건축공학", email: "" };
    }
    const info = JSON.parse(raw);
    const analysisKeywords = Array.isArray(info?.studentAnalysis?.keyKeywords) ? info.studentAnalysis.keyKeywords : [];
    const keywords = analysisKeywords.length ? analysisKeywords.slice(0, 3) : fallbackKeywords;
    return {
      keywords,
      subject: normalizeSubject(info?.supportTrack),
      careerHint: info?.careerHint || info?.hopeDepartment || "건축공학",
      email: info?.email || "",
    };
  } catch {
    return { keywords: fallbackKeywords, subject: "과학탐구", careerHint: "건축공학", email: "" };
  }
}

export default function Step3() {
  const [initialContext] = useState(() => readUserContext());
  const [baseTopics, setBaseTopics] = useState<TopicResult[]>(initialBaseTopics);
  const [customTopics, setCustomTopics] = useState<TopicResult[]>([]);
  const [subject, setSubject] = useState(initialContext.subject);
  const [customKeyword, setCustomKeyword] = useState("");
  const [careerHint, setCareerHint] = useState(initialContext.careerHint);
  const [email, setEmail] = useState(initialContext.email);
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [mailSending, setMailSending] = useState(false);

  const allTopics = useMemo(() => [...baseTopics, ...customTopics], [baseTopics, customTopics]);
  const canAdd = customTopics.length < 3;

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "diagnosis_step3_topics",
        JSON.stringify({
          subject,
          careerHint,
          topics: allTopics,
        }),
      );
    } catch {}
  }, [allTopics, careerHint, subject]);

  const requestTopics = useCallback(async (payload: { subject: string; keywords: string[]; careerHint: string; count: number }) => {
    const response = await fetch("/api/diagnosis/exploration-topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || "탐구 주제 생성 실패");
    return Array.isArray(data?.topics) ? (data.topics as TopicResult[]) : [];
  }, []);

  const generateBaseTopics = useCallback(async (nextSubject: string, keywords: string[], nextCareerHint: string) => {
    setLoading(true);
    setStatus("");
    try {
      const topics = await requestTopics({
        subject: nextSubject,
        keywords: keywords.slice(0, 3),
        careerHint: nextCareerHint,
        count: 3,
      });
      setBaseTopics(topics.slice(0, 3));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "기본 주제 생성 실패");
    } finally {
      setLoading(false);
    }
  }, [requestTopics]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void generateBaseTopics(initialContext.subject, initialContext.keywords, initialContext.careerHint);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [generateBaseTopics, initialContext]);

  async function handleAddCustomTopic() {
    const keyword = customKeyword.trim();
    if (!keyword || !canAdd) return;
    setLoading(true);
    setStatus("");
    try {
      const topics = await requestTopics({
        subject,
        keywords: [keyword, careerHint].filter(Boolean),
        careerHint,
        count: 1,
      });
      if (topics[0]) {
        setCustomTopics((prev) => [...prev, { ...topics[0], id: `custom-${prev.length + 1}`, keyword }].slice(0, 3));
        setCustomKeyword("");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "추가 주제 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMail() {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("메일주소를 입력해 주세요.");
      return;
    }
    if (allTopics.length < 3) {
      setStatus("메일 발송은 최소 3개 주제 생성 후 가능합니다.");
      return;
    }

    setMailSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          subject: "[나의 입시멘토] 탐구활동/독서/세특 결과",
          reportData: {
            service: "나의 입시멘토",
            type: "exploration-setuk",
            subject,
            careerHint,
            topics: allTopics,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      setStatus(result?.message || (response.ok ? "메일 발송 완료" : "메일 발송 실패"));
    } catch {
      setStatus("메일 발송 중 오류가 발생했습니다.");
    } finally {
      setMailSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[980px] rounded-[28px] border border-[#eadfce] bg-white p-6 text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
        <div>
          <div className="text-xs font-black tracking-[0.18em] text-[#8b1a1a]">RESULT ACTION</div>
          <h2 className="mt-2 text-xl font-black text-[#1a0f08]">총 {allTopics.length}개 주제 결과</h2>
          <p className="mt-1 text-sm font-semibold text-[#6c6256]">
            기본 3개와 추가 최대 3개를 한 번에 인쇄/메일 발송합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white">
            인쇄
          </button>
          <button
            onClick={() => setMailOpen((prev) => !prev)}
            className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]"
          >
            메일 보내기
          </button>
        </div>
        {mailOpen ? (
          <div className="mt-4 flex w-full flex-wrap gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="메일주소 입력"
              className="min-w-[260px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            />
            <button
              onClick={handleSendMail}
              disabled={mailSending}
              className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {mailSending ? "발송 중" : "현재 3~6개 전체 발송"}
            </button>
          </div>
        ) : null}
      </div>

      {status ? <div className="mb-4 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a] print:hidden">{status}</div> : null}

      <section className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">BASIC 3 TOPICS</div>
            <h3 className="mt-1 text-2xl font-black text-[#1f1720]">학생부 추출 키워드 기반 기본 주제 3개</h3>
          </div>
          {loading ? <span className="text-sm font-bold text-[#8b1a1a]">생성 중</span> : null}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {baseTopics.map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index + 1} />
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
        <div className="mb-4">
          <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">CUSTOM TOPICS</div>
          <h3 className="mt-1 text-xl font-black text-[#1f1720]">개인 주제 추가 검색</h3>
          <p className="mt-1 text-sm font-semibold text-[#6c6256]">
            과목과 주제를 입력해 최대 3개까지 추가할 수 있습니다.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]">
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-bold">
            {subjectOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input value={customKeyword} onChange={(event) => setCustomKeyword(event.target.value)} placeholder="추가 주제 입력" className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold" />
          <input value={careerHint} onChange={(event) => setCareerHint(event.target.value)} placeholder="진로/학과 힌트" className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold" />
          <button onClick={handleAddCustomTopic} disabled={!canAdd || loading} className="rounded-xl bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white disabled:opacity-40">
            검색
          </button>
        </div>
        <div className="mt-3 text-xs font-bold text-slate-500">추가 {customTopics.length}/3 · 총 {allTopics.length}/6</div>
      </section>

      {customTopics.length ? (
        <section>
          <div className="mb-3 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">ADDED TOPICS</div>
          <div className="grid gap-4 lg:grid-cols-3">
            {customTopics.map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={baseTopics.length + index + 1} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TopicCard({ topic, index }: { topic: TopicResult; index: number }) {
  return (
    <article className="break-inside-avoid rounded-[24px] border border-[#eadfce] bg-[#fffdf8] p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">{index}번 주제</span>
        <span className="text-xs font-bold text-slate-400">{topic.subject}</span>
      </div>
      <h4 className="mb-3 text-lg font-black leading-6 text-[#1f1720]">{topic.topic_title}</h4>
      <p className="mb-4 text-sm font-semibold leading-6 text-slate-600">{topic.topic_direction}</p>
      <InfoList title="논문" items={topic.papers} />
      <InfoList title="자료" items={topic.data_sources} />
      <InfoList title="독서" items={topic.books} />
      <div className="mt-4 rounded-[18px] border border-[#d7c2a5] bg-[#fff8ee] p-4">
        <div className="mb-2 text-xs font-black tracking-wide text-[#8b1a1a]">세특문장</div>
        <p className="text-sm font-bold leading-6 text-[#1f1720]">{topic.setuk_sentence}</p>
      </div>
    </article>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-xs font-black text-[#1f1720]">{title}</div>
      <ul className="space-y-1 text-xs font-semibold leading-5 text-slate-600">
        {items?.length ? items.slice(0, 3).map((item) => <li key={item}>- {item}</li>) : <li>- 표시할 내용 없음</li>}
      </ul>
    </div>
  );
}
