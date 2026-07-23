import Image from "next/image";
import Link from "next/link";

export default function IntroPage() {
  return (
    <main className="intro-landing">
      <section className="intro-stage">
        <div className="intro-mark">SUPREMA PLATFORM</div>
        <div className="intro-visual">
          <Image
            src="/5_16_IMAGE.png"
            alt="수프리마 플랫폼 인트로 화면"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="intro-copybox">
          <h1>나의 입시멘토</h1>
          <p>학생부 업로드부터 분석, 탐구 주제, 입시 위치 진단까지 하나의 흐름으로 이동합니다.</p>
        </div>
      </section>

      <nav className="intro-nav" aria-label="intro shortcuts">
        <Link href="/diagnosis" className="intro-link intro-link-primary">
          시작하기
        </Link>
        <Link href="/report" className="intro-link">
          결과보기
        </Link>
        <Link href="/exploration" className="intro-link">
          탐구주제
        </Link>
      </nav>
    </main>
  );
}
