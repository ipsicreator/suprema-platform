import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Sparkles,
  Send,
  Copy,
  Check,
  MessageSquare,
  Clock3,
  Lightbulb,
  Printer,
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './ExplorationModule.css';

interface ExplorationModuleProps {
  onBack: () => void;
  studentData: { id: string; name: string } | null;
}

type Proposal = {
  title: string;
  motivation: string;
  steps: string[];
  recordDraft: string;
};

const STORAGE_KEY = 'exploration_chat_state_v2';

const ExplorationModule: React.FC<ExplorationModuleProps> = ({ studentData }) => {
  const [videoTitle, setVideoTitle] = useState('Designing Agentic Browser UX');
  const [interest, setInterest] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.videoTitle === 'string') setVideoTitle(parsed.videoTitle);
      if (typeof parsed.interest === 'string') setInterest(parsed.interest);
      if (typeof parsed.extraContext === 'string') setExtraContext(parsed.extraContext);
      if (Array.isArray(parsed.proposals)) setProposals(parsed.proposals);
    } catch (error) {
      console.warn('Failed to restore chat state:', error);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ videoTitle, interest, extraContext, proposals })
    );
  }, [videoTitle, interest, extraContext, proposals]);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const genAI = useMemo(() => new GoogleGenerativeAI(apiKey), [apiKey]);

  const handleGenerate = async () => {
    if (!interest.trim()) {
      alert('영상 또는 학생의 핵심 관심사를 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
학생명: "${studentData?.name ?? '미지정'}"
영상/주제: "${videoTitle}"
관심사: "${interest}"
추가 맥락: "${extraContext}"

아래 형식의 JSON 배열로 3개를 생성해 주세요.
[{
  "title":"탐구 제목",
  "motivation":"교육적 의미와 학생부 연계 근거",
  "steps":["단계1","단계2","단계3"],
  "recordDraft":"세특 기재용 문장 초안"
}]
JSON 외 텍스트는 금지합니다.
      `;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setProposals(parsed);
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDraft = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const printProposal = () => {
    window.print();
  };

  return (
    <div className="exploration-shell">
      <section className="left-workspace">
        <div className="browser-frame">
          <div className="browser-topbar">
            <div className="traffic-lights">
              <span />
              <span />
              <span />
            </div>
            <div className="url-bar">youtube.com/watch?v=agentic-ux</div>
          </div>

          <div className="video-stage">
            <button className="play-chip" type="button" aria-label="play">
              <Play size={26} />
            </button>
          </div>

          <div className="video-caption">
            <h2>{videoTitle}</h2>
            <p>Transcript, chapters, and current playback moment are available.</p>
            <div className="skeleton-lines">
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <aside className="right-assistant">
        <div className="assistant-head">
          <span className="brand-dot" />
          <strong>Chromex</strong>
        </div>

        <div className="assistant-copy">
          <h3>Turn videos into useful notes</h3>
          <p>Summaries, timestamped notes, and one-click study actions.</p>
          <button type="button" className="print-btn" onClick={printProposal}>
            <Printer size={14} />
            출력하기
          </button>
        </div>

        <ul className="assistant-actions">
          <li><MessageSquare size={15} /> Summarize video</li>
          <li><Sparkles size={15} /> Explain current scene</li>
          <li><Lightbulb size={15} /> Chapter notes</li>
        </ul>

        <div className="timestamp-panel">
          <h4><Clock3 size={14} /> Timestamped notes</h4>
          <p>00:42 Why context matters</p>
          <p>04:18 Planning before acting</p>
          <p>09:31 DOM vs. vision usage</p>
        </div>

        <div className="chat-compose">
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="영상 제목"
          />
          <textarea
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="핵심 요청: 예) 이 영상 기반 탐구 주제/세특 초안 생성"
            rows={3}
          />
          <textarea
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            placeholder="추가 맥락: 목표 전공, 학생 강점, 수행평가 형식"
            rows={2}
          />
          <button type="button" onClick={handleGenerate} disabled={isGenerating}>
            <Send size={15} />
            <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
          </button>
        </div>
      </aside>

      {proposals.length > 0 && (
        <section className="proposal-drawer">
          {proposals.map((item, idx) => (
            <article key={idx} className="proposal-card">
              <h5>{item.title}</h5>
              <p>{item.motivation}</p>
              <ul>
                {(item.steps || []).map((step, sIdx) => (
                  <li key={sIdx}>{step}</li>
                ))}
              </ul>
              <div className="draft-row">
                <code>{item.recordDraft}</code>
                <button type="button" onClick={() => copyDraft(item.recordDraft, idx)}>
                  {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default ExplorationModule;
