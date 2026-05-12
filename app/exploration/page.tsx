"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RequireAuth from "../components/auth/RequireAuth";
import pb from "@/lib/pocketbase";

interface ExplorationRecord {
  id: string;
  subject: string;
  topic_title: string;
  topic_direction: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  expected_conclusion: string;
  tip?: string;
  created: string;
}

export default function ExplorationPage() {
  const [subject, setSubject] = useState("국어");
  const [autoKeywords, setAutoKeywords] = useState<string[]>([]);
  const [manualKeywords, setManualKeywords] = useState("");
  const [careerHint, setCareerHint] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [grade, setGrade] = useState<"middle" | "high">("high");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExplorationRecord[]>([]);
  const [history, setHistory] = useState<ExplorationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);

  const subjects = ["국어", "영어", "수학", "사회탐구", "과학탐구", "정보(IT)"];

  const fetchHistoryAndKeywords = async () => {
    const user = pb.authStore.model;
    if (!user) return;

    try {
      const hResp = await fetch(`/api/platform/topics?userId=${user.id}`);
      const hData = await hResp.json();
      if (Array.isArray(hData)) setHistory(hData);

      const kResp = await fetch(`/api/platform/keywords?userId=${user.id}`);
      const kData = await kResp.json();
      if (kData.keywords) setAutoKeywords(kData.keywords);

      const dResp = await pb.collection('diagnosis_sessions').getFirstListItem(`student_name = "${user.name}"`, { sort: '-created' }).catch(() => null);
      if (dResp && dResp.target_university) {
        setTargetGoal(`${dResp.target_university} ${dResp.target_department || ""}`);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchHistoryAndKeywords();
  }, []);

  const handleOpenGuide = async (univName: string) => {
    try {
      const resp = await fetch(`/data/university_guides.json`);
      const data = await resp.json();
      const key = Object.keys(data.universities).find(k => k.includes(univName.substring(0, 3)));
      if (key) {
        setSelectedGuide({ ...data.universities[key], name: key });
      }
    } catch (e) {
      console.error("Failed to load guide:", e);
    }
  };

  const handleGenerate = async () => {
    const user = pb.authStore.model;
    if (!user) return;

    setLoading(true);
    try {
      const combined = [
        ...autoKeywords,
        ...(manualKeywords ? manualKeywords.split(",").map(k => k.trim()) : [])
      ].slice(0, 5).join(",");

      const response = await fetch("/api/platform/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subject,
          interests: combined,
          careerHint,
          targetGoal,
          grade,
          count: 5
        }),
      });
      const data = await response.json();
      if (data.topics) {
        setResults(data.topics);
        fetchHistoryAndKeywords();
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 pt-24 bg-[var(--bg-color)]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <img src="/suprema-logo.png" alt="대치수프리마 로고" style={{ height: "50px", width: "auto" }} />
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold gradient-text"
              style={{ margin: 0 }}
            >
              대치수프리마 AI 탐구 주제 Explorer
            </motion.h1>
          </div>
          <p className="text-[var(--text-secondary)]">대치 수프리마 입시&코칭센터의 학생부 키워드 + 관심사 + 목표 대학 결합형 탐구 제안 시스템</p>
        </header>

        <RequireAuth>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-[var(--accent-color)] hover:underline flex items-center gap-2"
            >
              {showHistory ? "← 돌아가기" : "📜 과거 추천 내역 보기"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!showHistory ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card p-8 mb-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">탐구 과목</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSubject(s)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${subject === s
                              ? "bg-[var(--accent-color)] text-white"
                              : "bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-color)]"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium">학교 급</label>
                    <div className="flex gap-4">
                      {["high", "middle"].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="grade"
                            checked={grade === g}
                            onChange={() => setGrade(g as any)}
                            className="accent-[var(--accent-color)]"
                          />
                          <span className="text-sm">{g === "high" ? "고등학생" : "중학생"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  {autoKeywords.length > 0 && (
                    <div className="p-4 bg-[var(--accent-color)] bg-opacity-5 rounded-lg border border-dashed border-[var(--accent-color)] border-opacity-30">
                      <label className="block text-xs font-bold text-[var(--accent-color)] mb-2 uppercase">학생부 분석 추출 키워드 (자동)</label>
                      <div className="flex gap-2">
                        {autoKeywords.map(k => (
                          <span key={k} className="px-3 py-1 bg-white bg-opacity-10 rounded text-sm">#{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">목표 대학 / 학과 (Goal)</label>
                      <input
                        type="text"
                        value={targetGoal}
                        onChange={(e) => setTargetGoal(e.target.value)}
                        placeholder="예: 서울대학교 컴퓨터공학과"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">희망 진로 힌트</label>
                      <input
                        type="text"
                        value={careerHint}
                        onChange={(e) => setCareerHint(e.target.value)}
                        placeholder="예: 데이터 사이언티스트"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">추가 관심 키워드 (2~3개, 쉼표 구분)</label>
                    <input
                      type="text"
                      value={manualKeywords}
                      onChange={(e) => setManualKeywords(e.target.value)}
                      placeholder="예: 환경 보호, 심리학, 마케팅..."
                      className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 bg-[var(--accent-color)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "AI가 주제를 탐색 중입니다..." : "맞춤형 탐구 주제 생성하기 →"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">최근 추천 받은 주제</h2>
                {history.length > 0 ? history.map((item) => (
                  <TopicCard key={item.id} topic={item} onGuideClick={handleOpenGuide} />
                )) : (
                  <div className="glass-card p-12 text-center text-[var(--text-secondary)]">
                    아직 추천 내역이 없습니다.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!showHistory && results.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white text-sm">✨</span>
                AI가 제안하는 탐구 솔루션
              </h2>
              <div className="space-y-6">
                {results.map((topic, idx) => (
                  <TopicCard key={idx} topic={topic} onGuideClick={handleOpenGuide} />
                ))}
              </div>
            </motion.section>
          )}
        </RequireAuth>
      </div>

      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card max-w-2xl w-full p-8 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-10 hover:bg-opacity-20"
              >
                ✕
              </button>

              <div className="mb-6">
                <span className="text-[var(--accent-color)] font-bold text-sm tracking-widest uppercase">UNIVERSITY ADMISSION GUIDE</span>
                <h2 className="text-3xl font-bold mt-1">{selectedGuide.name}</h2>
              </div>

              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">핵심 평가 요소 (Pillars)</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.focus.map((f: string) => (
                      <span key={f} className="px-3 py-1 bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)] rounded-md text-sm">#{f}</span>
                    ))}
                  </div>
                </div>

                <p className="text-[var(--text-primary)] leading-relaxed italic">
                  "{selectedGuide.description}"
                </p>

                <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-white border-opacity-10">
                  <h3 className="text-sm font-bold mb-4">입학처 오피셜 탐구 가이드</h3>
                  <ul className="space-y-3">
                    {selectedGuide.official_guide_summary.map((s: string, i: number) => (
                      <li key={i} className="text-sm flex gap-3 text-[var(--text-secondary)]">
                        <span className="text-[var(--accent-color)]">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={selectedGuide.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3 text-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium transition-all"
                >
                  공식 입학처 가이드북 원문 보기 ↗
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function TopicCard({ topic, onGuideClick }: { topic: any; onGuideClick?: (univ: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-8 border-l-4 border-l-[var(--accent-color)] text-left"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-md bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)] text-xs font-bold">
            {topic.subject}
          </span>
          {topic.tip && onGuideClick && (
            <button
              onClick={() => {
                const univ = topic.tip.match(/\[(.*?) /)?.[1];
                if (univ) onGuideClick(univ);
              }}
              className="px-3 py-1 rounded-md bg-white bg-opacity-10 text-xs hover:bg-opacity-20 transition-all border border-white border-opacity-10"
            >
              📖 대학 가이드 확인
            </button>
          )}
        </div>
        <span className="text-[var(--text-secondary)] text-xs">
          {new Date(topic.created || Date.now()).toLocaleDateString()}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-4">{topic.topic_title}</h3>
      <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
        {topic.topic_direction}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            📚 추천 도서
          </h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            {Array.isArray(topic.books) ? topic.books.map((b: string) => <li key={b}>• {b}</li>) : <li>정보 없음</li>}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">
            📄 관련 논문/자료
          </h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            {Array.isArray(topic.papers) ? topic.papers.map((p: string) => <li key={p}>• {p}</li>) : <li>정보 없음</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {topic.tip && (
          <div className="p-4 bg-[var(--accent-color)] bg-opacity-10 rounded-lg border border-[var(--accent-color)] border-opacity-30 flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <h4 className="text-xs font-bold text-[var(--accent-color)] mb-1 uppercase tracking-wider">University Target Guide</h4>
              <p className="text-sm text-[var(--text-primary)] font-medium">{topic.tip}</p>
            </div>
          </div>
        )}

        <div className="p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Expected Conclusion</h4>
          <p className="text-sm italic">"{topic.expected_conclusion}"</p>
        </div>
      </div>
    </motion.div>
  );
}
