import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const advantages = [
  "희망 대학·전형·모집단위 기준의 합격 가능성 예측",
  "영역별 생기부 보완 방향 자동 제안",
  "상담 결과를 종합 리포트로 즉시 정리",
];

const supplies = ["학생부", "지원대학", "지원학과", "탐구주제 등"];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.heroWrap}>
        <div className={styles.topRow}>
          <a href="/FINAL_1_8_PAGES.zip" className={styles.centerLink} target="_blank" rel="noreferrer">
            센터 소개
          </a>
        </div>

        <div className={styles.logoPanel}>
          <h1>
            <span>대치</span> 수프리마
          </h1>
          <p>Su·Prima 입시&코칭 센터</p>
        </div>

        <p className={styles.tagline}>입시의 본질을 분석하고, 최적의 전략으로 합격을 설계합니다.</p>

        <div className={styles.ctaRow}>
          <Link href="/diagnosis" className={styles.ctaPrimary}>
            진단 시작
          </Link>
          <Link href="/intro" className={styles.ctaGhost}>
            진단서비스 소개
          </Link>
        </div>

        <div className={styles.heroImageBox}>
          <Image
            src="/suprema-hero-style.png"
            alt="수프리마 히어로 스타일 레퍼런스"
            width={1600}
            height={900}
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      <section className={styles.serviceGrid}>
        <article className={`${styles.serviceCard} ${styles.cardBlue}`}>
          <p className={styles.serviceIndex}>SERVICE 01</p>
          <h2>AI 탐구 세특 솔루션</h2>
          <p className={styles.serviceBody}>
            학생의 관심사와 진로를 기반으로 탐구주제, 독서, 세특 보완 방향을 연결 추천합니다.
          </p>
          <Link href="/exploration" className={styles.serviceButton}>
            솔루션 시작하기
          </Link>
        </article>

        <article className={`${styles.serviceCard} ${styles.cardGreen}`}>
          <p className={styles.serviceIndex}>SERVICE 02</p>
          <h2>나의 입시 위치 진단</h2>
          <p className={styles.serviceBody}>
            학생부 분석으로 현재 경쟁력을 진단하고, 지원 대학 기준으로 실행 가능한 전략을 제안합니다.
          </p>
          <Link href="/diagnosis" className={styles.serviceButtonAlt}>
            진단 시작하기
          </Link>
        </article>
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.infoCard}>
          <h3>AI 입시플랫폼 장점</h3>
          <ul>
            {advantages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoCard}>
          <h3>준비물</h3>
          <ul>
            {supplies.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <footer className={styles.footer}>
        <p className={styles.footerBrand}>대치 수프리마 Su·Prima 입시&코칭 센터</p>
        <p className={styles.footerLine}>대표: 이기욱 대표컨설턴트 · 연락처: 010-2370-1077 (문자전송)</p>
        <p className={styles.footerLine}>소재지: 서울시 강남구 테헤란로 326 B1F</p>
        <div className={styles.footerChannels}>
          <a href="https://band.us/@suprima" target="_blank" rel="noreferrer">
            네이버 밴드: band.us/@suprima
          </a>
          <a href="https://blog.naver.com/gouniv_hifive" target="_blank" rel="noreferrer">
            블로그: blog.naver.com/gouniv_hifive
          </a>
          <a href="https://www.instagram.com/suprima_ipsicreator" target="_blank" rel="noreferrer">
            인스타그램: suprima_ipsicreator
          </a>
        </div>
      </footer>
    </main>
  );
}
