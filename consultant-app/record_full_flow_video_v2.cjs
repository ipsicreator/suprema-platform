const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');
const ffmpegPath = require('ffmpeg-static');

const BASE_URL = 'http://127.0.0.1:5174';
const outDir = path.join(process.cwd(), 'public', 'qa_captures');
const framesDir = path.join(outDir, 'frames_fullflow_v2');
const shotsDir = path.join(outDir, 'shots_v2');
const outputVideo = path.join(outDir, 'full_flow_1920x1080_v2.mp4');

fs.mkdirSync(framesDir, { recursive: true });
fs.mkdirSync(shotsDir, { recursive: true });
for (const f of fs.readdirSync(framesDir)) if (f.endsWith('.png')) fs.unlinkSync(path.join(framesDir, f));
for (const f of fs.readdirSync(shotsDir)) if (f.endsWith('.png')) fs.unlinkSync(path.join(shotsDir, f));

let frame = 1;
const pad = (n) => String(n).padStart(4, '0');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function snap(page, tag, hold = 6) {
  await page.screenshot({ path: path.join(shotsDir, `${tag}.png`) });
  for (let i = 0; i < hold; i++) {
    await page.screenshot({ path: path.join(framesDir, `frame_${pad(frame++)}.png`) });
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

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 } });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
  await sleep(1400);

  const bodyText = await page.evaluate(() => document.body.innerText);
  if (bodyText.includes('로그인') && bodyText.includes('비밀번호')) throw new Error('still_on_login_screen');

  await snap(page, '00_dashboard', 8);

  await clickLiByText(page, '단계별 실행 화면');
  await sleep(1000);
  await snap(page, '01_workflow', 8);

  for (const stage of ['입력 전', '입력', '진행', '결과', '경과', '산출']) {
    await clickButtonByText(page, stage);
    await sleep(800);
    if (stage === '진행') {
      await clickButtonByText(page, '100명 전체 처리 실행');
      await sleep(1000);
    }
  }
  await snap(page, '07_deliverable', 8);

  await clickLiByText(page, '학생 CRM 관리');
  await sleep(900);
  await snap(page, '08_crm', 8);

  await clickButtonByText(page, '분석 이동');
  await sleep(1000);
  await snap(page, '10_student_detail', 8);

  await page.click('textarea');
  await page.keyboard.type('수학 심화탐구 활동, 과학 프로젝트 발표, 팀 협업 우수', { delay: 20 });
  await clickButtonByText(page, '분석 실행');
  await sleep(900);
  await snap(page, '11_result', 10);

  await browser.close();

  execFileSync(ffmpegPath, ['-y', '-framerate', '2', '-i', path.join(framesDir, 'frame_%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', outputVideo], { stdio: 'inherit' });
  console.log('VIDEO_DONE:' + outputVideo);
})();
