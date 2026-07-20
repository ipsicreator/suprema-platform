import puppeteer from "puppeteer";

const baseUrl = process.env.VERIFY_BASE_URL || "http://localhost:3012";

const savedUserInfo = {
  consultantName: "담당 컨설턴트",
  studentName: "John",
  schoolName: "Seoul High",
  grade: "고3",
  studentPhone: "010-1234-5678",
  parentPhone: "010-8765-4321",
  email: "mary@example.com",
  studentIndex: 2.5,
  gradingSystem: "9-level",
  careerHint: "건축공학",
  supportTrack: "과학탐구",
  parsedSubjects: [
    { subject: "수학", unit: 4, grade: 2, semester: 1 },
    { subject: "물리학", unit: 3, grade: 2, semester: 1 },
    { subject: "화학", unit: 3, grade: 3, semester: 2 },
  ],
  studentAnalysis: {
    keyKeywords: ["구조 안정성", "에너지 설계", "친환경"],
    academicCapacity: "수학과 과학 과목에서 공학 계열 학습 기반이 확인됩니다.",
    seTeukAnalysis: "건축 구조와 도시 안전을 연결한 탐구 기록이 확인됩니다.",
    majorSuitability: "건축공학 및 도시공학 계열과의 연결성이 높습니다.",
    comprehensiveOpinion: "탐구 확장성과 전공 적합성을 함께 강화할 필요가 있습니다.",
    majorField: "건축공학",
  },
};

const savedStep3Topics = {
  subject: "과학탐구",
  careerHint: "건축공학",
  topics: [
    {
      id: "initial-1",
      subject: "과학탐구",
      keyword: "구조 안정성",
      topic_title: "태양광 모듈 강도와 기후 변화가 발전 효율에 미치는 영향",
      books: ["친환경 에너지 개론"],
      papers: ["태양광 발전 효율 최적화 연구"],
      data_sources: ["한국에너지공단 데이터"],
      setuk_sentence: "구조 안정성 탐구를 바탕으로 태양광 모듈 효율 변화를 비교 분석함",
    },
    {
      id: "initial-2",
      subject: "과학탐구",
      keyword: "에너지 설계",
      topic_title: "교실 CO2 농도와 학생 집중도의 상관 분석",
      books: ["실내 환경과 데이터 분석"],
      papers: ["실내 공기질과 학습 성과의 관계"],
      data_sources: ["환경부 대기질 데이터"],
      setuk_sentence: "공기질과 집중도의 상관을 분석하고 개선 방향을 도출함",
    },
    {
      id: "custom-1",
      subject: "과학탐구",
      keyword: "도시 환경",
      topic_title: "미세먼지 성분과 현장별 온도 차이 비교",
      books: ["도시 환경과 분석"],
      papers: ["도시 미세먼지 연구"],
      data_sources: ["환경통계정보서비스"],
      setuk_sentence: "도시 환경 문제를 현장 특성과 연결하여 해석함",
    },
  ],
};

const savedStep4State = {
  email: "mary@example.com",
  openId: "target-1",
  targets: [
    {
      id: "target-1",
      university: "서울대학교",
      department: "경영대학",
      trackType: "학생부종합",
      admissionName: "지역균형선발",
      judgment: "도전",
      reason: "탐구 주제와 전공 적합성이 연결되지만 추가 보완이 필요합니다.",
    },
    {
      id: "target-2",
      university: "연세대학교",
      department: "경영학과",
      trackType: "학생부교과",
      admissionName: "추천형",
      judgment: "안정",
      reason: "중간권 성적과 전공 관심이 잘 맞습니다.",
    },
    {
      id: "target-3",
      university: "고려대학교",
      department: "경제학과",
      trackType: "학생부종합",
      admissionName: "학업우수형",
      judgment: "불가",
      reason: "현재 성적과 학생부 구성만으로는 추천이 어렵습니다.",
    },
  ],
};

const checks = [
  {
    route: "/diagnosis/step1",
    name: "step1",
    texts: ["학생정보입력", "학생이름*", "학교명*", "PDF분석하기", "다음단계로이동"],
  },
  {
    route: "/diagnosis/step2",
    name: "step2",
    texts: ["학생부분석", "학생부원문", "요약비교분석", "비교평가", "세특비교2과목", "비교학생불러오기", "위험요소체크"],
  },
  {
    route: "/diagnosis/step3",
    name: "step3",
    texts: ["탐구활동/독서/세특", "학생부추출키워드기반기본주제3개", "개인주제추가검색", "기본3개재생성", "메일보내기"],
  },
  {
    route: "/diagnosis/step4",
    name: "step4",
    texts: ["입시위치진단", "진단계요약", "희망대학3개진단", "도전", "안정", "불가", "4단계초기화"],
  },
];

console.log("launch:browser");
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  pipe: true,
  protocolTimeout: 120000,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  defaultViewport: { width: 1440, height: 1600, deviceScaleFactor: 1 },
});

try {
  for (const check of checks) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);
    console.log(`open:${check.route}`);
    await page.goto(`${baseUrl}${check.route}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.evaluate((value, step3Value, step4Value) => {
      sessionStorage.setItem("suprema_user_info", JSON.stringify(value));
      sessionStorage.setItem("diagnosis_step3_topics", JSON.stringify(step3Value));
      sessionStorage.setItem("diagnosis_step4_state", JSON.stringify(step4Value));
      sessionStorage.setItem("diagnosis_step3_email", "mary@example.com");
      sessionStorage.setItem("diagnosis_step2_local_memo", "학생부 비교 메모");
    }, savedUserInfo, savedStep3Topics, savedStep4State);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ""));
    console.log(`--- ${check.name} ---`);
    for (const text of check.texts) {
      console.log(`${text}:${bodyText.includes(text.replace(/\s+/g, ""))}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
