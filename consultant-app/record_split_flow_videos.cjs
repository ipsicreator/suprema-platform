const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');
const ffmpegPath = require('ffmpeg-static');

const BASE_URL = 'http://127.0.0.1:5174';
const outDir = path.join(process.cwd(), 'public', 'qa_captures');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ensureCleanDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.png')) fs.unlinkSync(path.join(dir, f));
  }
}

async function clickLiByText(page, text) {
  return await page.$$eval('li', (els, t) => {
    const target = els.find((el) => (el.textContent || '').includes(t));
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, text);
}

async function clickButtonByText(page, text) {
  return await page.$$eval('button', (els, t) => {
    const target = els.find((el) => (el.textContent || '').includes(t));
    if (!target) return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, text);
}

async function typeIfExists(page, selector, text) {
  const el = await page.$(selector);
  if (!el) return false;
  await el.click({ clickCount: 3 });
  await page.keyboard.type(text, { delay: 18 });
  return true;
}

async function renderVideo(framesDir, outputVideo) {
  execFileSync(
    ffmpegPath,
    [
      '-y',
      '-framerate',
      '2',
      '-i',
      path.join(framesDir, 'frame_%04d.png'),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '30',
      outputVideo,
    ],
    { stdio: 'inherit' }
  );
}

async function recordStudentAnalysisVideo(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await sleep(1200);

  const framesDir = path.join(outDir, 'frames_student_result');
  const videoPath = path.join(outDir, 'student_analysis_result_flow.mp4');
  ensureCleanDir(framesDir);

  let frame = 1;
  const pad = (n) => String(n).padStart(4, '0');
  const hold = async (count = 6) => {
    for (let i = 0; i < count; i++) {
      await page.screenshot({ path: path.join(framesDir, `frame_${pad(frame++)}.png`) });
    }
  };

  await clickLiByText(page, '학생 CRM 관리');
  await sleep(800);
  await hold(6);

  await clickButtonByText(page, '분석 이동');
  await sleep(900);
  await hold(6);

  await typeIfExists(page, 'textarea', '수학 심화 탐구 보고서 작성, 생명과학 독서 발표, 협업 프로젝트 리더십 수행');
  await hold(6);

  await clickButtonByText(page, '분석 실행');
  await sleep(1000);
  await hold(8);

  await clickButtonByText(page, '출력하기');
  await sleep(500);
  await hold(6);

  await page.close();
  await renderVideo(framesDir, videoPath);
  return videoPath;
}

async function recordExplorationProposalVideo(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await sleep(1200);

  const framesDir = path.join(outDir, 'frames_exploration_result');
  const videoPath = path.join(outDir, 'exploration_proposal_flow.mp4');
  ensureCleanDir(framesDir);

  let frame = 1;
  const pad = (n) => String(n).padStart(4, '0');
  const hold = async (count = 6) => {
    for (let i = 0; i < count; i++) {
      await page.screenshot({ path: path.join(framesDir, `frame_${pad(frame++)}.png`) });
    }
  };

  await clickLiByText(page, '탐구활동 제안');
  await sleep(1000);
  await hold(8);

  const textareas = await page.$$('textarea');
  if (textareas[0]) {
    await textareas[0].click({ clickCount: 3 });
    await page.keyboard.type('데이터사이언스, 독서토론', { delay: 18 });
  }
  if (textareas[1]) {
    await textareas[1].click({ clickCount: 3 });
    await page.keyboard.type('기계공학 진로 희망, 팀 프로젝트 중심', { delay: 18 });
  }
  const input = await page.$('input[type="text"]');
  if (input) {
    await input.click({ clickCount: 3 });
    await page.keyboard.type('학생부 추출 키워드 기반 탐구 제안', { delay: 18 });
  }
  await hold(6);

  await clickButtonByText(page, 'Generate');
  await sleep(1700);
  await hold(8);

  await clickButtonByText(page, '출력하기');
  await sleep(500);
  await hold(6);

  await page.close();
  await renderVideo(framesDir, videoPath);
  return videoPath;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  try {
    const studentVideo = await recordStudentAnalysisVideo(browser);
    const exploreVideo = await recordExplorationProposalVideo(browser);
    console.log('VIDEO_DONE:' + studentVideo);
    console.log('VIDEO_DONE:' + exploreVideo);
  } finally {
    await browser.close();
  }
})();
