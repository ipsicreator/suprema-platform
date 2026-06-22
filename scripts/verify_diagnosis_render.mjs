import puppeteer from "puppeteer";

const baseUrl = process.env.VERIFY_BASE_URL || "http://localhost:3012";

const savedUserInfo = {
  consultantName: "담당컨설턴트",
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
    keyKeywords: ["구조안정성", "내진설계", "스마트건설"],
    academicCapacity: "수학·과학 과목에서 공학 계열 학습 기반을 확보했습니다.",
    seTeukAnalysis: "건축 구조와 도시 안전을 연결한 탐구 기록이 확인됩니다.",
    majorSuitability: "건축공학 및 도시공학 계열과 연결성이 높습니다.",
    comprehensiveOpinion: "탐구 확장성과 전공 적합도를 함께 강화하는 전략이 필요합니다.",
    majorField: "건축공학",
  },
};

const checks = [
  {
    route: "/diagnosis/step2",
    name: "step2",
    texts: ["학생부 분석", "학생부원문", "요약비교분석", "비교평가", "인쇄", "메일 보내기"],
  },
  {
    route: "/diagnosis/step3",
    name: "step3",
    texts: ["탐구활동/독서/세특", "학생부 추출 키워드 기반 기본 주제 3개", "개인 주제 추가 검색", "인쇄", "메일 보내기"],
  },
  {
    route: "/diagnosis/step4",
    name: "step4",
    texts: ["입시위치진단", "진단계요약", "희망대학3개진단", "도전", "안정", "하향", "메일 보내기"],
  },
];

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  defaultViewport: { width: 1440, height: 1600, deviceScaleFactor: 1 },
});

try {
  for (const check of checks) {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}${check.route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate((value) => {
      sessionStorage.setItem("suprema_user_info", JSON.stringify(value));
    }, savedUserInfo);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((resolve) => setTimeout(resolve, 1200));
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
