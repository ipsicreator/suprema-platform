"use client";

import { useMemo, useState } from "react";
import { FULL_QUESTIONS_24, type FullChoice } from "../../../../lib/ipsidna/fullQuestions";
import { buildFullProfile } from "../../../../lib/ipsidna/fullScoring";
import { getEngineTypeFromUrl, getLastPrismEngineType } from "../../../../lib/ipsidna/storage";
import styles from "../../prism.module.css";

type FullAnswers = Record<string, FullChoice>;

function clampIndex(index: number, max: number) {
  return Math.min(Math.max(index, 0), max);
}

function saveLocal(key: string, value: any) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export default function PrismFullQuestionsPage() {
  const total = FULL_QUESTIONS_24.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<FullAnswers>({});
  const engineType = useMemo(() => getEngineTypeFromUrl() ?? getLastPrismEngineType(), []);

  const current = FULL_QUESTIONS_24[index];
  const progress = useMemo(() => Math.round(((index + 1) / total) * 100), [index, total]);

  const setChoice = (choice: FullChoice) => {
    setAnswers((prev) => ({ ...prev, [current.id]: choice }));
  };

  const canNext = Boolean(answers[current.id]);
  const goPrev = () => setIndex((v) => clampIndex(v - 1, total - 1));
  const goNext = () => setIndex((v) => clampIndex(v + 1, total - 1));

  const finish = () => {
    const profile = buildFullProfile(answers);
    saveLocal("prism_full_answers", answers);
    saveLocal("prism_full_profile", profile);
    window.location.href = engineType ? `/ipsidna-prism/full/result?type=${engineType}` : "/ipsidna-prism/full/result";
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <img className={styles.logo} src="/suprema-logo.png" alt="대치수프리마" />
          <div className={styles.brandText}>입시DNA프리즘 · 본 진단</div>
        </div>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} aria-label={`진행률 ${progress}%`} />
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.kicker}>
            {index + 1}/{total}
          </div>
          <h1 className={styles.qTitle}>{current.prompt}</h1>
        </div>

        <div className={styles.choices}>
          {(["A", "B", "C", "D"] as const).map((k) => {
            const picked = answers[current.id] === k;
            return (
              <button key={k} className={`${styles.choice} ${picked ? styles.choicePicked : ""}`} onClick={() => setChoice(k)}>
                <div className={styles.choiceKey}>{k}</div>
                <div className={styles.choiceText}>{current.choices[k]}</div>
              </button>
            );
          })}
        </div>

        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={goPrev} disabled={index === 0}>
            이전
          </button>
          {index < total - 1 ? (
            <button className={styles.navBtnPrimary} onClick={goNext} disabled={!canNext}>
              다음
            </button>
          ) : (
            <button className={styles.navBtnPrimary} onClick={finish} disabled={!canNext}>
              결과 보기
            </button>
          )}
        </div>

        <div className={styles.caption}>본 진단은 “병목”을 찾기 위한 체크입니다. 정답은 없습니다.</div>
      </section>
    </main>
  );
}
