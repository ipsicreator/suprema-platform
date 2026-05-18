import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(repoRoot, "consultant-app", "node_modules", "puppeteer"));

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function toFileUrl(p) {
  const abs = path.resolve(p);
  return `file:///${abs.replaceAll("\\", "/")}`;
}

async function main() {
  const pdfPath = process.argv[2];
  const outDirArg = process.argv[3];
  const pagesArg = process.argv[4] || "1,2,3";

  if (!pdfPath) {
    console.error("Usage: node scripts/pdf/render_pdf_previews.mjs <pdf_path> <out_dir> [pages_csv]");
    process.exit(1);
  }

  const outDir = outDirArg ? path.resolve(outDirArg) : path.join(repoRoot, "scratch", "pdf_previews");
  fs.mkdirSync(outDir, { recursive: true });

  const pages = pagesArg
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-features=Translate,OptimizationHints",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 1550, deviceScaleFactor: 2 });

    // Chrome PDF viewer supports #page=N
    for (const n of pages) {
      const url = `${toFileUrl(pdfPath)}#page=${n}`;
      await page.goto(url, { waitUntil: "networkidle2" });
      // Give the PDF viewer time to render the page canvas
      await page.waitForTimeout(800);
      const outPath = path.join(outDir, `page_${String(n).padStart(2, "0")}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      process.stdout.write(outPath + "\n");
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

