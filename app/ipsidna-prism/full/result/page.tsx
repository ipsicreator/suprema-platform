"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EngineType } from "../../../../lib/ipsidna/questions";
import { getEngineTypeFromUrl, getLastPrismEngineType } from "../../../../lib/ipsidna/storage";
import styles from "../../prism.module.css";

type FullProfile = {
  dimensionScore: Record<string, number>;
  topBottlenecks: Array<{ dimension: string; score: number }>;
  summary: string;
  next2Weeks: string[];
  consultNeed: "low" | "medium" | "high";
};

function loadProfile(): FullProfile | null {
  try {
    const raw = window.localStorage.getItem("prism_full_profile");
    if (!raw) return null;
    return JSON.parse(raw) as FullProfile;
  } catch {
    return null;
  }
}

const LABEL: Record<string, string> = {
  reading: "읽기/조건 해석",
  representation: "표상 전환(그림·표·식)",
  inference: "추론/식화",
  verification: "검산/실수 방지",
  organization: "정리/기록/서술",
  stamina: "지속/페이스/번아웃",
  exploration: "탐구/질문/확장",
};

export default function PrismFullResultPage() {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const engineType = useMemo(() => (getEngineTypeFromUrl() ?? getLastPrismEngineType()) as EngineType | null, []);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const need = profile?.consultNeed ?? "medium";
  const needText = need === "high" ? "높음" : need === "medium" ? "중간" : "낮음";

  if (!profile) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.qTitle}>본 진단 결과를 찾을 수 없습니다.</h1>
          <div className={styles.caption}>본 진단을 다시 진행해 주세요.</div>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/ipsidna-prism/full">
              본 진단 시작
            </Link>
            <Link className={styles.secondary} href="/ipsidna-prism/diagnosis">
              약식진단으로
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <img className={styles.logo} src="/suprema-logo.png" alt="대치수프리마" />
          <div className={styles.brandText}>입시DNA프리즘 · 본 진단 결과</div>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.resultHeader}>
          <div className={styles.kicker}>요약</div>
          <h1 className={styles.resultTitle}>병목 리포트</h1>
          <div className={styles.note}>{profile.summary}</div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>상담 권장도</div>
          <div className={styles.caseTextStrong}>심층 상담 권장: {needText}</div>
          <div className={styles.caption}>권장도가 높을수록 ‘병목이 성적을 직접 흔들고 있다’는 의미입니다.</div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>병목 TOP 3</div>
          <div className={styles.scoreRow}>
            {profile.topBottlenecks.map((t) => (
              <div key={t.dimension} className={styles.scoreItem}>
                <div className={styles.scoreKey}>{LABEL[t.dimension] || t.dimension}</div>
                <div className={styles.scoreVal}>{t.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>다음 2주 액션(바로 실행)</div>
          <ul className={styles.list}>
            {profile.next2Weeks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primary} href="/intro">
            심층진단/상담으로 연결
          </Link>
          <Link
            className={styles.secondary}
            href={engineType ? `/ipsidna-prism/toolkit?type=${engineType}` : "/ipsidna-prism/toolkit?type=SEDAN"}
          >
            상담 툴킷(내부) 열기
          </Link>
        </div>
      </section>
    </main>
  );
}
