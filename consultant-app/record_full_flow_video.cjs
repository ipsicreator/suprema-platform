const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const puppeteer = require('puppeteer');
const ffmpegPath = require('ffmpeg-static');

const outDir = path.join(process.cwd(), 'public', 'qa_captures');
const framesDir = path.join(outDir, 'frames_fullflow');
const outputVideo = path.join(outDir, 'full_flow_1920x1080.mp4');

fs.mkdirSync(framesDir, { recursive: true });
for (const f of fs.readdirSync(framesDir)) {
  if (f.endsWith('.png')) fs.unlinkSync(path.join(framesDir, f));
}

let frame = 1;
const pad = (n) => String(n).padStart(4, '0');

async function snap(page, hold = 6) {
  for (let i = 0; i < hold; i++) {
    const file = path.join(framesDir, `frame_${pad(frame++)}.png`);
    await page.screenshot({ path: file });
  }
}

async function clickByText(page, text) {
  await page.evaluate((t) => {
    const nodes = Array.from(document.querySelectorAll('button, a, li, span, div'));
    const target = nodes.find((el) => (el.textContent || '').includes(t));
    if (target) target.click();
  }, text);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1920, height: 1080 } });
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  await snap(page, 8); // initial

  // 단계형 실행 화면
  await clickByText(page, '단계별 실행 화면');
  await new Promise((r) => setTimeout(r, 1200));
  await snap(page, 8);

  const stages = ['입력 전', '입력', '진행', '결과', '경과', '산출'];
  for (const stage of stages) {
    await clickByText(page, stage);
    await new Promise((r) => setTimeout(r, 1000));
    if (stage === '진행') {
      await clickByText(page, '100명 전체 처리 실행');
      await new Promise((r) => setTimeout(r, 1200));
    }
    await snap(page, 6);
  }

  // 학생 CRM
  await clickByText(page, '학생 CRM 관리');
  await new Promise((r) => setTimeout(r, 1200));
  await snap(page, 8);

  // 학생 분석 화면
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').includes('분석 이동'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await snap(page, 8);

  await browser.close();

  execFileSync(ffmpegPath, [
    '-y',
    '-framerate', '2',
    '-i', path.join(framesDir, 'frame_%04d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    outputVideo,
  ], { stdio: 'inherit' });

  console.log('VIDEO_DONE:' + outputVideo);
})();

