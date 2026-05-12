import Link from "next/link";
import styles from "./page.module.css";

const detailCards = [
  {
    title: "학생부 구조 진단",
    body: "교과/비교과/활동 흐름을 정리해 강점과 리스크를 시각적으로 확인합니다.",
  },
  {
    title: "탐구·독서·세특 추천",
    body: "학과 적합성을 기준으로 탐구주제, 독서, 세특 보완 포인트를 연결 추천합니다.",
  },
  {
    title: "대학 모의지원",
    body: "지원 대학별 요구 역량과 학생부 상태를 매칭해 실행 전략을 제시합니다.",
  },
  {
    title: "종합 리포트",
    body: "상담 내용과 액션플랜을 보고서로 자동 정리해 학부모/학생 공유가 쉬워집니다.",
  },
];

export default function IntroPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.badge}>DIAGNOSIS SERVICE</p>
        <h1>진단서비스 소개</h1>
        <p className={styles.description}>
          수프리마 진단서비스는 상담 현장에서 바로 쓰는 실무형 분석 도구입니다.
          학생부를 근거로 탐구·지원전략·리포트까지 연동해, 상담 품질을 일정하게 유지합니다.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.secondaryButton}>랜딩으로</Link>
          <Link href="/diagnosis" className={styles.primaryButton}>진단 시작</Link>
        </div>
      </section>

      <section className={styles.grid}>
        {detailCards.map((item) => (
          <article key={item.title} className={styles.card}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className={styles.flowCard}>
        <h3>서비스 흐름</h3>
        <ol>
          <li>사용자 정보 입력</li>
          <li>학생부 분석</li>
          <li>탐구주제/독서/세특 추천</li>
          <li>대학 모의지원</li>
          <li>종합 리포트 생성</li>
        </ol>
      </section>
    </main>
  );
}

