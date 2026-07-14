import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(".codex/screens");
fs.mkdirSync(outDir, { recursive: true });

const port = process.env.CAPTURE_PORT || "3004";
const pages = [
  ["step1", `http://127.0.0.1:${port}/diagnosis/step1`],
  ["evaluation", `http://127.0.0.1:${port}/diagnosis/step1/evaluation`],
  ["exploration", `http://127.0.0.1:${port}/exploration`],
  ["diagnosis", `http://127.0.0.1:${port}/diagnosis`],
];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const [name, url] of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1600, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
    await page.screenshot({
      path: path.join(outDir, `${name}.png`),
      fullPage: true,
    });
    await page.close();
    console.log(`captured:${name}`);
  }
} finally {
  await browser.close();
}
