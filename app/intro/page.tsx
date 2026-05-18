"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./intro.module.css";
import { Brain, FileText, BarChart, Target, ChevronRight } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function IntroPage() {
  return (
    <div className={styles.rootWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <Image src="/suprema-logo.png" alt="Logo" width={220} height={60} priority />
        </div>
        <div className={styles.pageIndicator}>PAGE <span>01</span>/08</div>
      </header>

      <main className={styles.container}>
        <div className={styles.layoutGrid}>
          {/* Left Content */}
          <div className={styles.leftArea}>
            <motion.div {...fadeInUp} className={styles.titleSection}>
              <h1 className={styles.mainHeading}>서비스 개요</h1>
              <h2 className={styles.subHeading}>
                학생부 기반 전략 설계,<br />
                합격까지 대치수프리마와 함께
              </h2>
              <p className={styles.description}>
                체계적인 데이터를 통해 AI 솔루션부터,<br />
                서비스 흐름, 보고서 제공, 분석 기능 구성을<br />
                명확히 안내드립니다.
              </p>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className={styles.iconGrid}>
              <div className={styles.iconItem}>
                <div className={styles.iconBox}><Brain size={32} /></div>
                <div className={styles.iconText}>
                  <strong>AI 기반 분석</strong>
                  <p>정밀한 AI 분석으로<br />개인별 최적 전략 제시</p>
                </div>
              </div>
              <div className={styles.iconItem}>
                <div className={styles.iconBox}><FileText size={32} /></div>
                <div className={styles.iconText}>
                  <strong>맞춤 전략 제안</strong>
                  <p>학생부 데이터를 기반으로<br />맞춤 전략 제안</p>
                </div>
              </div>
              <div className={styles.iconItem}>
                <div className={styles.iconBox}><BarChart size={32} /></div>
                <div className={styles.iconText}>
                  <strong>통합 대시보드</strong>
                  <p>입시 전 과정을 한눈에<br />확인할 수 있는 대시보드</p>
                </div>
              </div>
              <div className={styles.iconItem}>
                <div className={styles.iconBox}><Target size={32} /></div>
                <div className={styles.iconText}>
                  <strong>합격까지 지원</strong>
                  <p>전략 수립부터 합격까지<br />전문가의 밀착 지원</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Dashboard Mockup */}
          <div className={styles.rightArea}>
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.dashboardCard}
            >
              <div className={styles.dbSidebar}>
                <div className={styles.dbLogo}>SUPREMA</div>
                <nav className={styles.dbNav}>
                  <div className={`${styles.navItem} ${styles.active}`}>대시보드</div>
                  <div className={styles.navItem}>학생 정보</div>
                  <div className={styles.navItem}>탐구·과목</div>
                  <div className={styles.navItem}>입시 전략 진단</div>
                  <div className={styles.navItem}>보고서</div>
                  <div className={styles.navItem}>설정</div>
                </nav>
              </div>
              <div className={styles.dbMain}>
                <div className={styles.dbHeader}>대시보드</div>
                <div className={styles.dbGrid}>
                  <div className={styles.statCard}><span>지원 가능 대학</span><strong>2 상향</strong></div>
                  <div className={styles.statCard}><span>추천 탐구 주제</span><strong>5 건</strong></div>
                  <div className={styles.statCard}><span>세특 요약</span><strong>3 건</strong></div>
                  <div className={styles.statCard}><span>합격 가능성</span><strong className={styles.highlight}>92%</strong></div>
                </div>
                <div className={styles.dbContentArea}>
                  <div className={styles.radarBox}>
                    <div className={styles.boxTitle}>핵심 역량 분석</div>
                    <div className={styles.radarChart}>
                      <div className={styles.radarLayer} />
                    </div>
                  </div>
                  <div className={styles.topicBox}>
                    <div className={styles.boxTitle}>추천 탐구 주제</div>
                    <ul className={styles.topicList}>
                      <li>데이터 기반 분석과 사회문제 해결</li>
                      <li>기후변화와 에너지 전환</li>
                      <li>바이오 기술의 미래와 윤리</li>
                    </ul>
                    <button className={styles.moreBtn}>더 보기</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className={styles.bottomActions}>
          <button className={styles.darkBtn}>AI 탐구 · 세특 솔루션 보기 <ChevronRight /></button>
          <button className={styles.brownBtn}>입시 위치 진단 서비스 보기 <ChevronRight /></button>
          <button className={styles.whiteBtn}>서비스 둘러보기 <ChevronRight /></button>
        </div>
      </main>
    </div>
  );
}
