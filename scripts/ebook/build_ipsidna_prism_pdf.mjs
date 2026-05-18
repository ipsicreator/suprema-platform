import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(repoRoot, "consultant-app", "node_modules", "puppeteer"));

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const filename = "입시DNA프리즘_학습엔진분석_출판형.pdf";
const outPublic = path.join(repoRoot, "public", "ebooks", filename);
const outAssets = path.join(repoRoot, "output_assets", "ebook", filename);

const escapeHtml = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const premiumPath = path.join(repoRoot, "data", "ipsidna_prism", "ebook_source_premium.json");
const narrativePath = path.join(repoRoot, "data", "ipsidna_prism", "ebook_source_narrative.json");
const sourcePath = path.join(repoRoot, "data", "ipsidna_prism", "ebook_source.json");
const pickPath = fs.existsSync(premiumPath) ? premiumPath : fs.existsSync(narrativePath) ? narrativePath : sourcePath;
const hasSource = fs.existsSync(pickPath);
const source = hasSource ? JSON.parse(fs.readFileSync(pickPath, "utf-8")) : null;
const sourceChapters = Array.isArray(source?.chapters) ? source.chapters : [];
const appendixFromRawPath = sourcePath;
let appendixRaw = null;
try {
  appendixRaw = JSON.parse(fs.readFileSync(appendixFromRawPath, "utf-8"));
} catch {
  appendixRaw = null;
}

const normalizeBlock = (block) =>
  String(block || "")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .trim();

const blockToHtml = (block) => {
  const text = normalizeBlock(block);
  if (!text) return "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => l.startsWith("*"));
  const nonBullet = lines.filter((l) => !l.startsWith("*"));

  if (bulletLines.length >= 2 && bulletLines.length >= nonBullet.length) {
    const bullets = bulletLines.map((l) => l.replace(/^\*\s*/, ""));
    const title = nonBullet.length ? nonBullet.join(" ") : "핵심";
    return `
      <div class="box">
        <div class="boxTitle">${escapeHtml(title)}</div>
        <ul class="bullets">${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      </div>
    `;
  }

  if (lines.length <= 3 && text.length <= 120) {
    return `<div class="quote"><p>${escapeHtml(lines.join("<br/>"))}</p></div>`;
  }

  return `<p>${escapeHtml(text).replaceAll("\n", "<br/>")}</p>`;
};

const takeLead = (blocks) => {
  const first = normalizeBlock(blocks?.[0] || "");
  if (!first) return "";
  const sentence = first.split(".")[0].trim();
  return sentence.length > 70 ? sentence.slice(0, 70) + "…" : sentence;
};

const prismSvg = `
  <svg viewBox="0 0 320 220" width="220" height="160" aria-hidden="true">
    <defs>
      <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="rgba(255,255,255,0.85)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0.12)"/>
      </linearGradient>
      <linearGradient id="ray" x1="0" x2="1">
        <stop offset="0" stop-color="rgba(255,255,255,0.00)"/>
        <stop offset="0.25" stop-color="rgba(255,255,255,0.22)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0.00)"/>
      </linearGradient>
    </defs>
    <path d="M180 20 L290 110 L220 200 L110 170 L100 70 Z" fill="url(#g1)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    <path d="M180 20 L220 200" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
    <path d="M100 70 L220 200" stroke="rgba(255,255,255,0.20)" stroke-width="1.2"/>
    <path d="M180 20 L100 70" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
    <rect x="0" y="150" width="210" height="6" fill="url(#ray)" opacity="0.55"/>
  </svg>
`;

const chapters = sourceChapters.length
  ? sourceChapters.map((c) => ({
      no: String(c.no || "").padStart(2, "0"),
      title: String(c.title || "").trim() || `CHAPTER ${String(c.no || "").padStart(2, "0")}`,
      blocks: Array.isArray(c.blocks) ? c.blocks : [],
    }))
  : [];

const questionItems = [
  { id: "Q01", prompt: "새 단원을 시작할 때, 아이가 먼저 하는 행동은?", A: "교과서/개념을 정리한다", B: "예시를 보며 큰 흐름을 잡는다", C: "문제를 바로 풀어본다", D: "다른 방식/도구로 먼저 해본다" },
  { id: "Q02", prompt: "문장제가 길어지면 가장 자주 나타나는 반응은?", A: "조건을 표시하며 천천히 읽는다", B: "상황을 이야기로 이해한다", C: "감으로 풀고 넘어가려 한다", D: "그림/표를 그리며 풀어본다" },
  { id: "Q03", prompt: "틀렸을 때 아이의 첫 반응은?", A: "어디서 틀렸는지 찾는다", B: "왜 그런지 맥락을 설명한다", C: "다시 빨리 풀어 재도전한다", D: "다른 방법으로 다시 해본다" },
  { id: "Q04", prompt: "숙제/과제가 많아지면?", A: "루틴대로 분배해 처리한다", B: "우선순위를 재조정한다", C: "단기간 몰아서 끝내려 한다", D: "흥미 있는 것부터 손댄다" },
  { id: "Q05", prompt: "설명(서술형)이 필요한 문제에서?", A: "정리된 문장으로 쓰려 한다", B: "이야기처럼 풀어쓴다", C: "답 위주로 간단히 쓴다", D: "그림/도식으로 표현한다" },
  { id: "Q06", prompt: "수학에서 검산은?", A: "습관적으로 한다", B: "필요할 때만 한다", C: "시간이 없으면 생략한다", D: "다른 풀이로 확인한다" },
  { id: "Q07", prompt: "낯선 유형 문제가 나오면?", A: "기본 원리를 떠올려 적용한다", B: "비슷한 사례를 연결한다", C: "일단 시도하며 패턴을 찾는다", D: "재미있어 하며 실험한다" },
  { id: "Q08", prompt: "실수가 반복되는 패턴은?", A: "과잉 확인으로 시간 초과", B: "정리 부족으로 과정 누락", C: "조건/단위 누락", D: "기록이 산만해 채점 손해" },
  { id: "Q09", prompt: "새 규칙/공식이 나오면?", A: "노트에 정리하고 암기한다", B: "왜 그런지 배경을 궁금해한다", C: "바로 문제에 적용해본다", D: "스스로 변형해본다" },
  { id: "Q10", prompt: "학원/수업 스타일 선호는?", A: "체계적 커리큘럼", B: "대화형/연결형 수업", C: "문제풀이 강훈련", D: "프로젝트/탐구형" },
  { id: "Q11", prompt: "성적이 떨어지면?", A: "계획을 재정비한다", B: "원인을 맥락에서 찾는다", C: "더 어려운 걸로 밀어붙인다", D: "방식을 바꿔 새 루트를 찾는다" },
  { id: "Q12", prompt: "책/자료 읽기에서?", A: "요약하고 정리한다", B: "주제 간 연결을 찾는다", C: "핵심만 빠르게 잡는다", D: "궁금한 곳을 파고든다" },
  { id: "Q13", prompt: "발표/말하기에서?", A: "준비한 내용대로 한다", B: "상대 반응에 맞춰 설명한다", C: "짧고 강하게 말한다", D: "즉흥적으로 예시를 든다" },
  { id: "Q14", prompt: "시간 제한이 걸리면?", A: "안정적으로 페이스 유지", B: "상황을 보고 조절", C: "속도를 급격히 올림", D: "유연하게 우회로 선택" },
  { id: "Q15", prompt: "오답/복기 방식은?", A: "체계적으로 정리", B: "원리와 연결해 정리", C: "재풀이 반복", D: "다른 풀이를 모음" },
  { id: "Q16", prompt: "탐구/실험 과제에서?", A: "자료를 정돈해 보고서", B: "결과를 의미로 해석", C: "결과를 경쟁적으로 만든다", D: "새로운 시도를 즐긴다" },
  { id: "Q17", prompt: "교과 간 연결(과학-수학 등)에서?", A: "각 과목을 분리해 정리", B: "연결 포인트를 잘 찾음", C: "어려운 부분만 집중 공략", D: "확장 아이디어가 많음" },
  { id: "Q18", prompt: "피드백을 받으면?", A: "지적을 반영해 수정", B: "의도/맥락을 설명", C: "다음엔 더 잘 해보려 함", D: "다르게 표현해봄" },
  { id: "Q19", prompt: "선행을 시키면?", A: "차근차근 따라간다", B: "이해되면 빠르게 확장", C: "속도는 빠르나 구멍이 생김", D: "흥미 없으면 안 붙음" },
  { id: "Q20", prompt: "문제 풀 때 필기/메모는?", A: "정돈된 메모", B: "핵심 키워드 메모", C: "최소한만", D: "그림/화살표로 자유롭게" },
  { id: "Q21", prompt: "중요한 시험 전날은?", A: "컨디션과 루틴 유지", B: "범위를 다시 연결", C: "약점만 고속 공략", D: "마음 가는 것부터" },
  { id: "Q22", prompt: "수학 외 과목(국어/사회)에서?", A: "정리형 학습 강점", B: "서술·연결 강점", C: "요점 압축 강점", D: "탐구·확장 강점" },
  { id: "Q23", prompt: "어려운 문제를 마주하면?", A: "단계별로 쪼갠다", B: "조건-맥락을 다시 본다", C: "일단 끝까지 밀어본다", D: "새 규칙을 만들어본다" },
  { id: "Q24", prompt: "학습 동기(스위치)는?", A: "성취 체크와 안정감", B: "의미/목적이 분명할 때", C: "승부/도전 과제가 있을 때", D: "호기심/탐색이 있을 때" },
];

const checklist = [
  ["체크", "문항"],
  ["□", "아이가 ‘틀림’을 두려워해 시도를 미루나요?"],
  ["□", "문제의 조건을 끝까지 읽기 전에 풀이를 시작하나요?"],
  ["□", "설명(말/글)로 자신의 생각을 정리하는 것이 어렵나요?"],
  ["□", "하나의 방식에 집착해 다른 표상(그림/표/식)으로 못 바꾸나요?"],
  ["□", "대회/심화에서 성취가 크지만 기본기가 불안정한가요?"],
  ["□", "탐구를 좋아하지만 결과 정리가 약한가요?"],
  ["□", "과제가 늘면 번아웃이 빠르게 오나요?"],
  ["□", "수학에서 검산을 ‘습관’으로 하지 못하나요?"],
];

const comparison = [
  ["유형", "강점", "리스크", "권장 훈련 1순위"],
  ["세단형", "정확·안정·재현", "새 형식 적응 느림", "표상 전환(그림↔표↔식)"],
  ["SUV형", "맥락 이해·연결", "압축/정리 단계 허술", "정리 루틴(요약-식화-검산)"],
  ["스포츠카형", "속도·돌파·도전", "조건 누락·기반 구멍", "검산 구조 + 기초 리빌드"],
  ["오프로드형", "탐색·실험·발상", "표준화/기록 약함", "결과 정리(보고서형 루틴)"],
];

const tableHtml = (rows, colClass = "") => {
  const head = rows[0];
  const body = rows.slice(1);
  return `
    <table class="tbl ${colClass}">
      <thead><tr>${head.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead>
      <tbody>
        ${body
          .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
          .join("")}
      </tbody>
    </table>
  `;
};

const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>입시DNA프리즘 — 학습엔진 분석</title>
    <style>
      @page { size: 152mm 228mm; margin: 18mm 16mm 18mm 19mm; }
      * { box-sizing: border-box; }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: "Noto Serif KR", "Batang", "Malgun Gothic", serif;
        background: #fbf7ee;
        color: #111113;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        min-height: 100vh;
        padding: 0;
      }
      .topbar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 9.5px;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: rgba(17,17,19,0.62);
        margin-bottom: 10mm;
      }
      .topbar .left { justify-self: start; text-transform: none; letter-spacing: -0.2px; }
      .topbar .center { justify-self: center; }
      .topbar .right { justify-self: end; text-transform: none; letter-spacing: -0.2px; }
      .paper {
        width: 100%;
        padding: 18mm 16mm 18mm 19mm;
        position: relative;
      }
      .paper::before{
        content:"";
        position:absolute;
        inset: 14mm 12mm 14mm 12mm;
        border: 1px solid rgba(17,17,19,0.10);
        border-radius: 6px;
        pointer-events:none;
      }
      .cover {
        position: relative;
        padding-top: 24mm;
        text-align: center;
      }
      .cover::before{ display:none; }
      .coverInner{
        max-width: 118mm;
        margin: 0 auto;
      }
      .logo {
        position: absolute;
        left: 16mm;
        top: 16mm;
        width: 22mm;
        height: 22mm;
        object-fit: contain;
      }
      .coverTitle {
        margin: 0 0 3mm 0;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 38px;
        letter-spacing: -1.0px;
        color: rgba(7,15,33,0.95);
      }
      .coverSubTitle{
        margin: 0 0 10mm 0;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 22px;
        letter-spacing: -0.6px;
        color: rgba(112,92,74,0.90);
      }
      .sub {
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 13px;
        color: rgba(17,17,19,0.68);
        margin: 0 0 10mm 0;
      }
      .tagline {
        font-size: 12.2px;
        line-height: 1.72;
        margin: 0 0 8mm 0;
      }
      .rule { height: 1px; background: rgba(17,17,19,0.18); width: 62mm; margin: 0 auto 6mm auto; }
      .coverClaim{
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 12px;
        letter-spacing: -0.3px;
        color: rgba(17,17,19,0.78);
        margin: 0 0 3mm 0;
        font-weight: 600;
      }
      .lead { font-size: 10.8px; line-height: 1.72; margin: 0 0 6mm 0; color: rgba(17,17,19,0.78); }
      .meta { font-size: 9.8px; color: rgba(17,17,19,0.62); }
      .coverPrism{
        margin: 12mm auto 0 auto;
        width: 72mm;
        opacity: 0.95;
      }
      .coverCTA{
        margin: 6mm auto 0 auto;
        padding: 9px 10px;
        border: 1px solid rgba(17,17,19,0.14);
        border-radius: 10px;
        background: rgba(255,255,255,0.72);
        text-align: left;
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        color: rgba(17,17,19,0.82);
        font-size: 10.4px;
        line-height: 1.6;
      }
      .coverCTATitle{ font-weight: 800; letter-spacing: -0.3px; margin-bottom: 3px; }
      .coverCTASub{ color: rgba(17,17,19,0.66); font-size: 10px; }

      .break { page-break-before: always; }
      .chapterOpen{
        padding: 18mm 16mm 18mm 16mm;
        color: rgba(255,255,255,0.92);
        background: radial-gradient(1200px 700px at 35% 20%, rgba(40,85,140,0.55), rgba(6,14,28,1) 55%);
      }
      .chapterOpen::before{ display:none; }
      .chapterOpenTop{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        margin-bottom: 16mm;
      }
      .chapterOpenBrand{
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 12px;
        letter-spacing: -0.2px;
        opacity: 0.95;
      }
      .chapterOpenNo{
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 14px;
        font-weight: 700;
        opacity: 0.85;
      }
      .chapterOpenBig{
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 72px;
        letter-spacing: -1px;
        margin: 0 0 6mm 0;
        font-weight: 800;
      }
      .chapterOpenTitle{
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 30px;
        line-height: 1.18;
        letter-spacing: -0.8px;
        margin: 0 0 10mm 0;
      }
      .chapterOpenLead{
        max-width: 78%;
        font-size: 12.2px;
        line-height: 1.7;
        color: rgba(255,255,255,0.86);
      }
      .chapterOpenPrism{
        position:absolute;
        right: 10mm;
        bottom: 12mm;
        opacity: 0.88;
      }
      .chapterNo {
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 10px;
        color: rgba(17,17,19,0.62);
        letter-spacing: 0.2px;
        margin: 0 0 2mm 0;
      }
      .chapterTitle {
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 18px;
        letter-spacing: -0.5px;
        margin: 0 0 4mm 0;
      }
      p { margin: 0 0 4mm 0; font-size: 10.6px; line-height: 1.75; }
      .quote {
        border-left: 2px solid rgba(17,17,19,0.14);
        padding-left: 10px;
        margin: 6mm 0 6mm 0;
        color: rgba(17,17,19,0.88);
      }
      .box {
        border: 1px solid rgba(17,17,19,0.14);
        border-radius: 10px;
        background: #fff;
        padding: 10px 10px;
        margin: 0 0 5mm 0;
      }
      .boxTitle {
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 10px;
        font-weight: 700;
        margin: 0 0 2mm 0;
      }
      .bullets { margin: 0; padding-left: 16px; }
      .bullets li { margin: 0 0 2mm 0; font-size: 10.2px; line-height: 1.7; }

      .tbl {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid rgba(17,17,19,0.14);
        background: #fff;
        font-size: 9.6px;
        line-height: 1.55;
      }
      .tbl th, .tbl td {
        border: 1px solid rgba(17,17,19,0.14);
        padding: 6px 6px;
        vertical-align: top;
      }
      .tbl th {
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        background: rgba(250,250,250,1);
        font-weight: 700;
        text-align: left;
      }
      .appendixKicker { font-family: "Noto Sans KR", "Malgun Gothic", sans-serif; font-size: 10px; color: rgba(17,17,19,0.62); margin-bottom: 2mm; }
      .appendixTitle { font-family: "Noto Sans KR", "Malgun Gothic", sans-serif; font-size: 16px; margin: 0 0 3mm 0; }
      .small { font-size: 9.8px; color: rgba(17,17,19,0.62); }
      .qItem { border-top: 1px solid rgba(17,17,19,0.12); padding-top: 10px; margin-top: 10px; }
      .qNo { font-family: "Noto Sans KR", "Malgun Gothic", sans-serif; font-size: 10px; color: rgba(17,17,19,0.62); margin: 0 0 2mm 0; }
      .qPrompt { margin: 0 0 2mm 0; font-size: 10.8px; line-height: 1.6; }
      .qChoices { margin: 0; padding-left: 16px; }
      .qChoices li { margin: 0 0 1.6mm 0; font-size: 10.0px; line-height: 1.65; }
      .appendixBlock { margin-top: 8mm; }
      .diagTable { font-size: 9.2px; }
      .diagTable th:nth-child(1), .diagTable td:nth-child(1){ width: 10mm; text-align:center; }
      .diagTable th:nth-child(2), .diagTable td:nth-child(2){ width: auto; }
      .diagTable th:nth-child(3), .diagTable td:nth-child(3),
      .diagTable th:nth-child(4), .diagTable td:nth-child(4),
      .diagTable th:nth-child(5), .diagTable td:nth-child(5),
      .diagTable th:nth-child(6), .diagTable td:nth-child(6){ width: 10mm; text-align:center; }
      .diagTable td:nth-child(n+3){ color: rgba(17,17,19,0.55); font-size: 12px; line-height: 1; }
      .typeLegend{
        margin-top: 6mm;
        display:grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 8px;
        font-family: "Noto Sans KR", "Malgun Gothic", sans-serif;
        font-size: 9.4px;
        color: rgba(17,17,19,0.78);
      }
      .typeLegendItem{
        border: 1px solid rgba(17,17,19,0.12);
        border-radius: 10px;
        padding: 8px 8px;
        background: rgba(255,255,255,0.85);
      }
      .typeLegendKey{ font-weight: 900; margin-bottom: 4px; }
      .typeLegendSub{ color: rgba(17,17,19,0.62); line-height:1.5; }
    </style>
  </head>
  <body>
    <section class="paper cover">
      <img class="logo" src="file:///${path.join(repoRoot, "public", "suprema-logo.png").replaceAll("\\\\", "/")}" alt="대치수프리마" />
      <div class="coverInner">
        <div class="coverTitle">${escapeHtml(source?.meta?.title || "입시DNA프리즘")}</div>
        <div class="coverSubTitle">${escapeHtml(source?.meta?.subtitle || "학습엔진 분석")}</div>
        <div class="rule"></div>
        <div class="coverClaim">선행보다 먼저 봐야 하는 것</div>
        <div class="lead">이북은 출발점입니다. 목적지는 진단입니다. 진단은 상담으로 이어지고, 상담은 1:1 코칭으로 연결됩니다.</div>
        <div class="rule" style="width:44mm; opacity:0.7;"></div>
        <div class="tagline">대학입시와 진로를 결정하는<br/>아이 성장 분석 시스템</div>
        <div class="coverPrism">${prismSvg}</div>
        <div class="coverCTA">
          <div class="coverCTATitle">24문항 약식진단 시작</div>
          <div>웹앱: <strong>/ipsidna-prism</strong></div>
          <div class="coverCTASub">결과 리포트 → 심층진단/상담 → 1:1 코칭</div>
        </div>
        <div class="meta">발행: 대치수프리마 · ${new Date().toISOString().slice(0, 10)}</div>
      </div>
    </section>

    <section class="paper break">
      <div class="chapterTitle">프롤로그</div>
      <div class="quote">
        <p>입시는 한 번의 점프가 아니라, 긴 시간의 ‘누적 구조’입니다.<br/>초등 3~6은 그 누적이 ‘속도’가 아니라 ‘방향’으로 굳어지는 시기입니다.</p>
      </div>
      <p>많은 가정이 초등 후반에 ‘선행 속도’를 올리는 방식으로 불안을 해소합니다. 그러나 속도는 원인 진단 없이 올리면 쉽게 흔들립니다. 이 책은 ‘무엇을 얼마나 아는가’보다 먼저 ‘어떤 반응 구조로 배우는가’를 봅니다.</p>
      <div class="box">
        <div class="boxTitle">이북 ↔ 진단검사 연동</div>
        <ul class="bullets">
          <li>약식진단 24문항으로 내 아이의 학습엔진을 먼저 확인합니다.</li>
          <li>결과 리포트에서 ‘맞춤 읽기 순서’(추천 챕터)와 ‘다음 행동’을 제공합니다.</li>
          <li>심층진단/상담은 별도 예약 페이지로 연결합니다.</li>
        </ul>
      </div>
      <p class="small">약식진단 웹앱: /ipsidna-prism</p>
    </section>

    ${chapters
      .map((ch) => {
        const lead = takeLead(ch.blocks);
        const restBlocks = ch.blocks.slice(0);
        return `
          <section class="paper break chapterOpen">
            <div class="chapterOpenTop">
              <div class="chapterOpenBrand">${escapeHtml(source?.meta?.title || "입시DNA프리즘")}<div style="font-size:11px; opacity:0.82; margin-top:2px;">${escapeHtml(source?.meta?.subtitle || "학습엔진 분석")}</div></div>
              <div class="chapterOpenNo">CHAPTER ${escapeHtml(ch.no)}</div>
            </div>
            <div class="chapterOpenBig">${escapeHtml(ch.no)}</div>
            <div class="chapterOpenTitle">${escapeHtml(ch.title)}</div>
            <div class="chapterOpenLead">${escapeHtml(lead)}</div>
            <div class="chapterOpenPrism">${prismSvg}</div>
          </section>
          <section class="paper break">
            <div class="topbar">
              <div class="left">${escapeHtml(source?.meta?.title || "입시DNA프리즘")}</div>
              <div class="center">INNER DESIGN</div>
              <div class="right">대치수프리마</div>
            </div>
            <div class="chapterNo">CHAPTER ${escapeHtml(ch.no)}</div>
            <div class="chapterTitle">${escapeHtml(ch.title)}</div>
            ${restBlocks.map((b) => blockToHtml(b)).join("")}
          </section>
        `;
      })
      .join("")}

    <section class="paper break">
      <div class="appendixKicker">APPENDIX</div>
      <div class="appendixTitle">부록</div>
      <p class="small">약식진단(24문항) · 부모 체크리스트 · 유형 비교표 · 입시 변화 요약</p>
    </section>

    <section class="paper break">
      <div class="chapterTitle">A. 약식진단(24문항)</div>
      <p>각 문항에서 가장 ‘자주’ 보이는 반응을 선택하세요. A/B/C/D 중 하나를 고릅니다. 결과는 네 가지 학습엔진 유형(세단형·SUV형·스포츠카형·오프로드형)으로 요약됩니다.</p>
      ${(() => {
        const header = ["번호", "문항", "A", "B", "C", "D"];
        const rows = [header, ...questionItems.map((q, i) => [`${i + 1}`, q.prompt, "○", "○", "○", "○"])];
        return tableHtml(rows, "diagTable");
      })()}
      <div class="typeLegend">
        <div class="typeLegendItem">
          <div class="typeLegendKey">A 세단형</div>
          <div class="typeLegendSub">안정 · 구조화</div>
        </div>
        <div class="typeLegendItem">
          <div class="typeLegendKey">B SUV형</div>
          <div class="typeLegendSub">연결 · 맥락</div>
        </div>
        <div class="typeLegendItem">
          <div class="typeLegendKey">C 스포츠카형</div>
          <div class="typeLegendSub">도전 · 돌파</div>
        </div>
        <div class="typeLegendItem">
          <div class="typeLegendKey">D 오프로드형</div>
          <div class="typeLegendSub">탐색 · 탐구</div>
        </div>
      </div>
    </section>

    <section class="paper break">
      <div class="chapterTitle">B. 부모 체크리스트</div>
      ${tableHtml(checklist)}
    </section>

    <section class="paper break">
      <div class="chapterTitle">C. 유형 비교표</div>
      ${tableHtml(comparison)}
    </section>

    <section class="paper break">
      <div class="chapterTitle">D. 입시 변화 요약(초등-중등 관점)</div>
      <p>핵심은 ‘평가의 이동’입니다. 지식의 정답을 맞히는 능력만으로는 상위권이 유지되지 않습니다. 과정 설명, 탐구 기록, 선택과목/활동 설계가 누적 구조를 만듭니다.</p>
      <div class="box">
        <div class="boxTitle">기억할 4문장</div>
        <ul class="bullets">
          <li>성격검사가 아니라 ‘학습 반응 구조’입니다.</li>
          <li>선행 속도보다 ‘엔진 정렬’이 먼저입니다.</li>
          <li>수학의 분기점은 문장제 처리(읽기-표상-추론-검산)입니다.</li>
          <li>탐구는 ‘주제’가 아니라 ‘질문 구조’가 경쟁력입니다.</li>
        </ul>
      </div>
      <p class="small">심층진단/상담 연결: /intro 또는 /leaflet (랜딩 확정 후 교체)</p>
      ${
        Array.isArray(appendixRaw?.appendix?.paragraphs) && appendixRaw.appendix.paragraphs.length
          ? `
            <div class="appendixBlock">
              <div class="chapterNo">부록 원문(합본)</div>
              ${appendixRaw.appendix.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
            </div>
          `
          : ""
      }
    </section>
  </body>
</html>`;

async function run() {
  const wantPreviews = process.argv.includes("--previews");

  fs.mkdirSync(path.dirname(outPublic), { recursive: true });
  fs.mkdirSync(path.dirname(outAssets), { recursive: true });
  const previewDir = path.join(repoRoot, "public", "ebooks", "previews");
  if (wantPreviews) fs.mkdirSync(previewDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    // A5-ish viewport for clean previews
    await page.setViewport({ width: 900, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.emulateMediaType("print");

    if (wantPreviews) {
      const indices = [0, 1, 2, 3, 4]; // cover + first pages
      for (const idx of indices) {
        const handle = await page.$(`section.paper:nth-of-type(${idx + 1})`);
        if (!handle) continue;
        const box = await handle.boundingBox();
        if (!box) continue;
        const outPng = path.join(previewDir, `page_${String(idx + 1).padStart(2, "0")}.png`);
        await handle.screenshot({ path: outPng });
      }
    }

    await page.pdf({
      path: outPublic,
      printBackground: true,
      width: "152mm",
      height: "228mm",
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width: 100%; font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif; font-size: 9px; color: rgba(17,17,19,0.55); padding: 0 16mm 8mm 16mm;">
          <div style="text-align: center;"><span class="pageNumber"></span></div>
        </div>
      `,
    });

    fs.copyFileSync(outPublic, outAssets);
    process.stdout.write(outPublic);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
