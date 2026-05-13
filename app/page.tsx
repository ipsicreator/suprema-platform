import Link from "next/link";
import styles from "./page.module.css";

const advantages = [
  "희망 대학·전형·모집단위 기준의 합격 가능성 예측",
  "영역별 생기부 보완 방향 자동 제안",
  "상담 결과를 종합 리포트로 즉시 정리",
];

const supplies = ["학생부", "지원 대학", "지원 학과", "탐구주제(초안 가능)"];
const centerInfo = [
  "대표: 이기욱 대표컨설턴트",
  "연락처: 010-2370-1077 (문자전송)",
  "소재지: 서울시 강남구 테헤란로 326 B1F",
];

const channels = [
  { label: "네이버 밴드", value: "band.us/@suprima", href: "https://band.us/@suprima" },
  { label: "블로그", value: "blog.naver.com/gouniv_hifive", href: "https://blog.naver.com/gouniv_hifive" },
  { label: "인스타그램", value: "suprima_ipsicreator", href: "https://www.instagram.com/suprima_ipsicreator" },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.topMenu}>
        <a href="/FINAL_1_8_PAGES.zip" className={styles.menuLink} target="_blank" rel="noreferrer">
          센터소개
        </a>
      </div>

      <section className={styles.hero}>
        <p className={styles.brand}>수프리마 AI 입시 플랫폼</p>
        <p className={styles.lead}>내 생기부, 이대로 괜찮을까?</p>
        <h1>
          <span>생기부 분석</span>으로 고민 해결!
        </h1>

        <div className={styles.actions}>
          <Link href="/diagnosis" className={styles.primary}>
            진단 시작
          </Link>
          <Link href="/intro" className={styles.secondary}>
            진단서비스 소개
          </Link>
        </div>
      </section>

      <section className={styles.visualBand}>
        <article className={styles.featureCardStrong}>희망 대학·전형·모집단위 합격 가능성 예측</article>
        <article className={styles.featureCardSoft}>영역별 생기부 보완 방법 안내</article>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>진단소개</h2>
          <p>
            학생부 데이터 기반으로 현재 위치를 점검하고, 탐구·지원 전략과 종합 리포트까지
            한 흐름으로 연결하는 유료형 컨설팅 진단 서비스입니다.
          </p>
        </article>

        <article className={styles.card}>
          <h2>AI 입시플랫폼 장점</h2>
          <ul>
            {advantages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h2>준비물</h2>
          <ul>
            {supplies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={styles.centerCard}>
        <h2>센터 소개</h2>
        <p className={styles.centerTitle}>대치수프리마 입시&코칭센터</p>
        <ul className={styles.centerList}>
          {centerInfo.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className={styles.channelRow}>
          {channels.map((channel) => (
            <a key={channel.label} href={channel.href} target="_blank" rel="noreferrer" className={styles.channelLink}>
              <strong>{channel.label}</strong>
              <span>{channel.value}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
