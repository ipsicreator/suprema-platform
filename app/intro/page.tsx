import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "학생부 업로드",
    desc: "학생부 PDF와 기본 정보를 넣으면 분석용 데이터가 정리됩니다.",
  },
  {
    step: "02",
    title: "학생부 분석",
    desc: "과목, 등급, 세특, 핵심 키워드를 한 화면에서 확인합니다.",
  },
  {
    step: "03",
    title: "탐구 주제",
    desc: "전공 방향에 맞는 탐구 주제와 연결 설명을 구성합니다.",
  },
  {
    step: "04",
    title: "입시 위치 진단",
    desc: "희망 대학별 적합도를 정리해 최종 결과를 보여줍니다.",
  },
] as const;

export default function IntroPage() {
  return (
    <main className="intro-root">
      <section className="intro-hero">
        <div className="intro-badge">SUPREMA PLATFORM</div>
        <h1 className="intro-title">나의 입시멘토</h1>
        <p className="intro-copy">
          탐구·세특·입시위치진단을 하나의 흐름으로 제공합니다. 첫 화면에서 전체 흐름을 보여주고, 아래 단계로 바로 이동할 수 있습니다.
        </p>
        <div className="intro-actions">
          <Link href="/process" className="primary-btn">
            전체 흐름 보기
          </Link>
          <Link href="/diagnosis" className="ghost-btn">
            입시위치진단 바로가기
          </Link>
        </div>
      </section>

      <section className="panel-grid">
        {steps.map((item) => (
          <article key={item.step} className="info-card">
            <span className="chip">{item.step}</span>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="topic-card">
        <h2>인트로 화면</h2>
        <p>이 화면은 첫 진입 화면입니다. 단계별 기능은 아래 버튼을 통해 이동합니다.</p>
        <ul>
          <li>학생부 업로드와 분석 결과 확인</li>
          <li>탐구 주제와 세특 키워드 정리</li>
          <li>희망 대학 기준 입시 위치 진단</li>
        </ul>
      </section>
    </main>
  );
}
