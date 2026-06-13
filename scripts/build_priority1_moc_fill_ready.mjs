import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "data", "pdf_raw_text");
const OUTPUT_PATH = path.join(ROOT, "outputs", "priority1_moc_fill_ready.xlsx");

const EXCLUDED_FIRST_PASS = new Set(["한신대", "연세대 미래캠퍼스", "서울교대"]);

const KEYWORDS = [
  { key: "모집인원", pattern: /모집인원/g },
  { key: "모집단위", pattern: /모집단위/g },
  { key: "입학정원", pattern: /입학정원/g },
  { key: "전형별 모집인원", pattern: /전형별\s*모집인원/g },
];

function normalizeText(text) {
  return String(text ?? "")
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchedKeywords(text) {
  const hits = [];
  for (const { key, pattern } of KEYWORDS) {
    if (pattern.test(text)) hits.push(key);
    pattern.lastIndex = 0;
  }
  return hits;
}

function snippetAround(text, index, radius = 220) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return text.slice(start, end).trim();
}

function cleanNumber(text) {
  const raw = String(text ?? "").replace(/,/g, "");
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  if (value >= 1900 && value <= 2100) return null;
  return value;
}

function extractCandidates(snippet) {
  const patterns = [
    /모집인원[^0-9]{0,18}([0-9][0-9,]*)\s*명?/g,
    /모집인원\s*[:：]?\s*([0-9][0-9,]*)\s*명?/g,
    /모집인원[^0-9]{0,18}([0-9][0-9,]*)/g,
    /전형별\s*모집인원[^0-9]{0,18}([0-9][0-9,]*)/g,
    /소계\s*([0-9][0-9,]*)/g,
    /합계\s*([0-9][0-9,]*)/g,
    /([0-9][0-9,]*)\s*명/g,
  ];

  const candidates = [];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(snippet)) !== null) {
      const number = cleanNumber(match[1]);
      if (number !== null) candidates.push(number);
      if (candidates.length >= 16) break;
    }
    if (candidates.length >= 16) break;
  }

  return [...new Set(candidates)];
}

function chooseSingleCandidate(candidates) {
  if (!candidates.length) return "";
  if (candidates.length === 1) return String(candidates[0]);
  return "";
}

function makeRows() {
  const files = fs.readdir(SOURCE_DIR).then((items) =>
    items.filter((name) => name.endsWith(".json")).sort(),
  );
  return files;
}

function writeGrid(sheet, rows) {
  if (!rows.length) return;
  const range = sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length);
  range.values = rows;
}

async function main() {
  const fileNames = await makeRows();

  const summaryRows = [[
    "학교",
    "파일",
    "총페이지",
    "키워드히트페이지",
    "모집인원히트페이지",
    "첫모집인원페이지",
    "첫모집인원후보",
    "후보개수",
    "1차제외",
    "비고",
  ]];

  const pageRows = [[
    "학교",
    "파일",
    "페이지",
    "매칭키워드",
    "후보숫자",
    "단일후보",
    "스니펫",
  ]];

  const reviewRows = [[
    "학교",
    "파일",
    "페이지",
    "매칭키워드",
    "사유",
    "스니펫",
  ]];

  const excludedRows = [[
    "학교",
    "파일",
    "이유",
  ]];

  for (const fileName of fileNames) {
    const filePath = path.join(SOURCE_DIR, fileName);
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
    const school = data.university || path.basename(fileName, ".json");
    const totalPages = data.total_pages ?? data.pages?.length ?? 0;
    const isExcluded = EXCLUDED_FIRST_PASS.has(school);
    if (isExcluded) {
      excludedRows.push([school, fileName, "1차 제외 요청 반영"]);
    }

    let keywordHitPages = 0;
    let mocHitPages = 0;
    let firstMocPage = "";
    let firstMocCandidates = "";
    let firstMocCandidateCount = "";
    let firstMocSnippet = "";
    let bestPage = "";
    let bestCandidates = "";
    let bestCandidateCount = Number.POSITIVE_INFINITY;
    let bestSnippet = "";

    for (const page of data.pages ?? []) {
      const text = normalizeText(page.text);
      if (!text) continue;

      const hits = matchedKeywords(text);
      if (!hits.length) continue;

      keywordHitPages += 1;
      const firstHitIndex = Math.min(
        ...hits.map((key) => text.indexOf(key)).filter((idx) => idx >= 0),
      );
      const snippet = snippetAround(text, Number.isFinite(firstHitIndex) ? firstHitIndex : 0);
      const candidates = extractCandidates(snippet);
      const selected = chooseSingleCandidate(candidates);
      if (hits.includes("모집인원")) {
        mocHitPages += 1;
        if (!firstMocPage) {
          firstMocPage = String(page.page);
          firstMocCandidates = candidates.join(", ");
          firstMocCandidateCount = String(candidates.length);
          firstMocSnippet = snippet;
        }
        if (candidates.length > 0 && candidates.length < bestCandidateCount) {
          bestPage = String(page.page);
          bestCandidates = candidates.join(", ");
          bestCandidateCount = candidates.length;
          bestSnippet = snippet;
        }
      }

      pageRows.push([
        school,
        fileName,
        page.page,
        hits.join(", "),
        candidates.join(", "),
        selected,
        snippet,
      ]);

      if (hits.includes("모집인원") && candidates.length === 0) {
        reviewRows.push([
          school,
          fileName,
          page.page,
          hits.join(", "),
          "모집인원 키워드 있으나 숫자 후보 없음",
          snippet,
        ]);
      } else if (hits.includes("모집인원") && candidates.length > 1) {
        reviewRows.push([
          school,
          fileName,
          page.page,
          hits.join(", "),
          "숫자 후보 다수 - 수동 검토 필요",
          snippet,
        ]);
      }
    }

    summaryRows.push([
      school,
      fileName,
      totalPages,
      keywordHitPages,
      mocHitPages,
      bestPage || firstMocPage,
      bestCandidates || firstMocCandidates,
      bestCandidateCount === Number.POSITIVE_INFINITY ? firstMocCandidateCount : String(bestCandidateCount),
      isExcluded ? "예" : "아니오",
      mocHitPages ? (bestPage ? "" : "모집인원 페이지는 있으나 후보가 비어 있음") : "모집인원 미검출",
    ]);
  }

  const workbook = Workbook.create();
  const summarySheet = workbook.worksheets.add("요약");
  const pageSheet = workbook.worksheets.add("페이지후보");
  const reviewSheet = workbook.worksheets.add("검토필요");
  const excludedSheet = workbook.worksheets.add("제외대상");

  writeGrid(summarySheet, summaryRows);
  writeGrid(pageSheet, pageRows);
  writeGrid(reviewSheet, reviewRows);
  writeGrid(excludedSheet, excludedRows);

  const widths = new Map([
    [summarySheet, [110, 170, 70, 100, 110, 95, 180, 80, 80, 150]],
    [pageSheet, [110, 170, 70, 140, 150, 100, 420]],
    [reviewSheet, [110, 170, 70, 140, 170, 420]],
    [excludedSheet, [110, 170, 170]],
  ]);

  for (const [sheet, cols] of widths.entries()) {
    for (let i = 0; i < cols.length; i += 1) {
      try {
        sheet.getRangeByIndexes(0, i, 1, 1).format.columnWidthPx = cols[i];
      } catch {}
    }
    try {
      const used = sheet.getUsedRange();
      if (used) {
        used.format.wrapText = true;
        used.format.verticalAlignment = "top";
      }
    } catch {}
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  const exported = await SpreadsheetFile.exportXlsx(workbook);
  await exported.save(OUTPUT_PATH);

  const verify = await SpreadsheetFile.importXlsx(await fs.readFile(OUTPUT_PATH));
  const check = await verify.inspect({
    kind: "table",
    range: "요약!A1:J6",
    include: "values",
    tableMaxRows: 6,
    tableMaxCols: 10,
  });
  console.log(check.ndjson);
  console.log(OUTPUT_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
