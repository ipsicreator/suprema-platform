"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { Shield, Users, BarChart, Brain, FileText, Target, ChevronRight } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function Home() {
  return (
    <div className={styles.rootWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logoArea}>
            <Image 
              src="/suprima-logo.png" 
              alt="대치 수프리마 Su-Prima 입시&코칭 센터" 
              width={260} 
              height={70} 
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className={styles.navLinks}>
            <Link href="/intro" className={styles.navTextOnly}>센터소개</Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <div className={styles.heroContainer}>
            <motion.h1 {...fadeInUp} className={styles.mainTitle}>
              학생부 AI분석 · 입시전략 플랫폼
            </motion.h1>
            <motion.div {...fadeInUp} className={styles.subTitleArea}>
              BY <span className={styles.underlinedText}>수프리마</span>
            </motion.div>
            <motion.p {...fadeInUp} className={styles.mainDescription}>
              AI 탐구 · 세특 플랫폼과 입시 위치 진단으로<br />
              학생의 강점을 발견하고, 최적의 전략을 설계합니다.
            </motion.p>
          </div>
        </section>

        {/* FEATURE SECTION - TYPO CHECK COMPLETED */}
        <section className={styles.featureSection}>
          <div className={styles.featureContainer}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Shield size={32} /></div>
              <div className={styles.featureText}>
                <strong>교육 데이터 기반 AI</strong>
                <p>신뢰도 높은 분석 결과</p>
              </div>
            </div>
            <div className={styles.vLine}></div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Users size={32} /></div>
              <div className={styles.featureText}>
                <strong>AI + 전문가 하이브리드</strong>
                <p>정확하고 실전적인 전략</p>
              </div>
            </div>
            <div className={styles.vLine}></div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><BarChart size={32} /></div>
              <div className={styles.featureText}>
                <strong>입시 전략 토탈 케어</strong>
                <p>진단부터 전략까지 한 번에</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION - TYPO CHECK COMPLETED */}
        <section className={styles.processSection}>
          <div className={styles.processContainer}>
            <div className={styles.processGrid}>
              {[
                { no: "01", icon: <Brain size={36} />, title: "교육 데이터 기반 AI", desc: "수많은 축적된 입시 데이터를 기반으로 신뢰성 높은 결과를 제공합니다." },
                { no: "02", icon: <Users size={36} />, title: "AI + 전문가 하이브리드", desc: "AI 분석과 입시 전문가의 검토를 결합해 실전에서 통하는 방향을 제시합니다." },
                { no: "03", icon: <FileText size={36} />, title: "완성도 높은 세특 문장", desc: "활동 내용이 아닌 역량과 성과 중심의 설득력 있는 문장을 제공합니다." },
                { no: "04", icon: <Target size={36} />, title: "입시 전략 토탈 케어", desc: "탐구 주제 발굴부터 세특 완성, 입시 전략 수립까지 한 번에 관리합니다." },
              ].map((step, idx) => (
                <motion.div key={idx} className={styles.processCard} {...fadeInUp}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNo}>{step.no}</span>
                    <span className={styles.cardIcon}>{step.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardDesc}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <motion.div {...fadeInUp}>
            <Link href="/diagnosis" className={styles.ctaButton}>
              시작하기 
              <ChevronRight size={56} className={styles.arrowIcon} />
            </Link>
            <p className={styles.ctaSubText}>지금 바로 AI 기반 입시 분석을 경험해보세요.</p>
          </motion.div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerInfo}>
              <strong>대치수프리마 입시&코칭센터</strong><br />
              대표 : 이기욱 대표컨설턴트 | 연락처 : 010-2370-1077(문자전송)<br />
              소재지 : 서울시 강남구 테헤란로 326 B1F<br />
              공식 홈페이지 : band.us/@suprima | blog.naver.com/gouniv_hifive
            </div>
            <div className={styles.copyright}>© 2025 Suprima Admission & Coaching Center. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
