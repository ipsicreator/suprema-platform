import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const outputDir = process.argv[2];
if (!outputDir) {
  throw new Error("Output directory argument is required.");
}

fs.mkdirSync(outputDir, { recursive: true });

const baseUrl = process.env.CAPTURE_BASE_URL || "http://localhost:3000";
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
    keyKeywords: ["구조안정성", "내진설계", "스마트건설"],
    academicCapacity: "수학·과학 과목에서 공학 계열 학습 기반을 확보했습니다.",
    seTeukAnalysis: "건축 구조와 도시 안전을 연결한 탐구 기록이 확인됩니다.",
    majorSuitability: "건축공학 및 도시공학 계열과 연결성이 높습니다.",
    comprehensiveOpinion: "탐구 확장성과 전공 적합도를 함께 강화하는 전략이 필요합니다.",
    majorField: "건축공학",
  },
};

const pages = [
  ["/diagnosis/step1", "01_학생정보입력.png"],
  ["/diagnosis/step2", "02_학생부_분석.png"],
  ["/diagnosis/step3", "03_탐구활동_독서_세특.png"],
  ["/diagnosis/step4", "04_입시위치_진단.png"],
];

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  defaultViewport: { width: 1440, height: 1600, deviceScaleFactor: 1 },
});

try {
  for (const [route, filename] of pages) {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate((value) => {
      sessionStorage.setItem("suprema_user_info", JSON.stringify(value));
    }, savedUserInfo);
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.screenshot({
      path: path.join(outputDir, filename),
      fullPage: true,
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(outputDir);
