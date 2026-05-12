import Link from "next/link";
import styles from "./page.module.css";

const benefits = [
  "상담 시작 전에 학생 경쟁력의 강점과 약점을 빠르게 파악할 수 있습니다.",
  "지원 대학/학과 기준으로 전략 방향을 근거 있게 설명할 수 있습니다.",
  "탐구주제, 독서, 세특 보완 포인트를 즉시 제안해 실행력을 높일 수 있습니다.",
  "종합 리포트까지 자동화해 상담 품질을 일관되게 유지할 수 있습니다.",
];

const checklist = ["학생부", "지원 대학", "지원 학과", "탐구주제(초안 가능)"];

const flowSteps = [
  "사용자 정보 입력",
  "학생부 분석",
  "탐구주제 · 독서 · 세특 찾기",
  "대학 모의지원",
  "종합 리포트",
];

const features = [
  {
    title: "경쟁력 진단",
    description: "현재 학생부 데이터로 강약점을 구조화하고 상담 우선순위를 제시합니다.",
    href: "/diagnosis",
    cta: "진단 시작",
  },
  {
    title: "전공/탐구 제안",
    description: "희망 계열과 활동 이력을 연결해 추천 전공과 탐구 방향을 도출합니다.",
    href: "/exploration",
    cta: "탐색 시작",
  },
  {
    title: "합격 전략 설계",
    description: "목표 대학 기준의 실행 계획을 제안해 학생별 액션 플랜을 만듭니다.",
    href: "/solution",
    cta: "전략 열기",
  },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.orbA} aria-hidden="true" />
        <div className={styles.orbB} aria-hidden="true" />
        <p className={styles.badge}>SUPREMA PLATFORM · STUDENT RECORD INTELLIGENCE</p>
        <h1>
          내 학생부 경쟁력은
          <br />
          <span>얼마나 될까?</span>
        </h1>
        <p className={styles.heroDescription}>
          추천 전공, 경쟁력 분석, 탐구 활동 제안, 보완점, 목표 대학 합격 전략까지.
          수프리마 플랫폼은 입시 컨설팅의 핵심 흐름을 한 번에 연결합니다.
        </p>

        <div className={styles.heroActions}>
          <Link href="/diagnosis" className={styles.primaryButton}>
            진단 시작
          </Link>
          <Link href="/intro" className={styles.secondaryButton}>
            플랫폼 소개
          </Link>
        </div>

        <div className={styles.statRow}>
          <article>
            <strong>01</strong>
            <p>학생부 중심 분석</p>
          </article>
          <article>
            <strong>02</strong>
            <p>대학/학과 기반 전략</p>
          </article>
          <article>
            <strong>03</strong>
            <p>상담용 종합 리포트</p>
          </article>
        </div>
      </section>

      <section className={styles.featureGrid}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.featureCard}>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <Link href={feature.href} className={styles.featureLink}>
              {feature.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className={styles.dualSection}>
        <article className={styles.infoCard}>
          <h3>이 플랫폼을 활용하면 좋은 점</h3>
          <ul>
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoCard}>
          <h3>진단 시작 전 준비물</h3>
          <ul>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={styles.flowSection}>
        <header>
          <h3>진단 시작 후 진행 흐름</h3>
          <p>상담의 핵심 단계를 순차적으로 자동 연결합니다.</p>
        </header>
        <div className={styles.flowRow}>
          {flowSteps.map((step, idx) => (
            <article key={step} className={styles.flowItem}>
              <span>{idx + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div>
          <h3>상담 운영을 표준화할 준비가 되셨나요?</h3>
          <p>학생부 기반 진단부터 대학 모의지원, 종합 리포트까지 바로 시작할 수 있습니다.</p>
        </div>
        <div className={styles.ctaActions}>
          <Link href="/diagnosis" className={styles.primaryButton}>
            진단 시작
          </Link>
          <a href="tel:010-2370-1077" className={styles.callButton}>
            010-2370-1077
          </a>
        </div>
      </section>
    </main>
  );
}
