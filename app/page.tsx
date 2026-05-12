import Link from "next/link";
import styles from "./page.module.css";

const prepItems = ["학생부", "지원대학", "지원학과", "탐구주제(초안 가능)"];
const flow = [
  "사용자 정보 입력",
  "학생부 분석",
  "탐구주제·독서·세특 추천",
  "대학 모의지원",
  "종합 리포트 생성",
];

const benefits = [
  "상담 시작 전, 학생의 강점·약점을 빠르게 구조화합니다.",
  "지원 대학/학과별 실행 전략을 근거 기반으로 제시합니다.",
  "탐구주제와 세특 보완 포인트를 즉시 제안합니다.",
  "최종 종합 리포트로 상담 품질을 표준화합니다.",
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.glowA} aria-hidden="true" />
        <div className={styles.glowB} aria-hidden="true" />

        <p className={styles.badge}>SUPREMA PLATFORM · ADMISSION INTELLIGENCE</p>
        <h1>
          내 학생부 경쟁력은
          <br />
          <span>어디까지 갈 수 있을까?</span>
        </h1>
        <p className={styles.subtitle}>
          학생부 분석부터 탐구 설계, 대학 모의지원, 종합 리포트까지.
          수프리마 플랫폼은 입시 컨설팅의 핵심 흐름을 하나로 연결합니다.
        </p>

        <div className={styles.actions}>
          <Link href="/diagnosis" className={styles.primary}>진단 시작</Link>
          <Link href="/intro" className={styles.secondary}>진단서비스 소개</Link>
        </div>

        <div className={styles.kpis}>
          <article><strong>STEP 01</strong><p>학생부 중심 진단</p></article>
          <article><strong>STEP 02</strong><p>지원 대학/학과 전략</p></article>
          <article><strong>STEP 03</strong><p>상담 종합 리포트</p></article>
        </div>
      </section>

      <section className={styles.sectionGrid}>
        <article className={styles.panel}>
          <h2>이 플랫폼을 활용하면 좋은 점</h2>
          <ul>
            {benefits.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className={styles.panel}>
          <h2>진단 시작 전 준비물</h2>
          <ul>
            {prepItems.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>

      <section className={styles.flowWrap}>
        <header>
          <h3>진단 시작 후 진행 흐름</h3>
          <p>상담 흐름을 자동 연결해 누락 없는 컨설팅을 지원합니다.</p>
        </header>
        <div className={styles.flowRow}>
          {flow.map((item, idx) => (
            <article key={item} className={styles.flowCard}>
              <span>{idx + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <h3>랜딩부터 종합 리포트까지, 한 번에 운영하세요.</h3>
          <p>화면별 텍스트 밀림 없이 데스크톱/모바일 모두 안정적으로 구성했습니다.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/diagnosis" className={styles.primary}>바로 시작</Link>
        </div>
      </section>
    </main>
  );
}

