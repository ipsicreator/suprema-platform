import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "file:///C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "data", "pdf_raw_text");
const outputPath = path.join(repoRoot, "outputs", "keyword_page_inventory_priority1.xlsx");

const firstPassExclude = new Set(["한신대", "연세대 미래캠퍼스", "서울교대"]);

const keywordPatterns = [
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

function findKeywordHits(text) {
  const hits = [];
  for (const { key, pattern } of keywordPatterns) {
    if (pattern.test(text)) {
      hits.push(key);
    }
    pattern.lastIndex = 0;
  }
  return hits;
}

function snippetAround(text, index, radius = 180) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return text.slice(start, end).trim();
}

function cleanCandidate(value) {
  if (!value) return null;
  const numeric = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;
  if (numeric >= 1900 && numeric <= 2100) return null;
  return String(Math.trunc(numeric));
}

function extractCandidateNumbers(snippet) {
  const candidates = [];
  const patterns = [
    /모집인원[^0-9]{0,12}([0-9][0-9,]*)\s*명?/g,
    /모집인원\s*[:：]?\s*([0-9][0-9,]*)\s*명?/g,
    /모집인원[^0-9]{0,12}([0-9][0-9,]*)/g,
    /소계\s*([0-9][0-9,]*)/g,
    /합계\s*([0-9][0-9,]*)/g,
    /([0-9][0-9,]*)\s*명/g,
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(snippet)) !== null) {
      const candidate = cleanCandidate(match[1]);
      if (candidate) candidates.push(candidate);
      if (candidates.length >= 12) break;
    }
    if (candidates.length >= 12) break;
  }

  return [...new Set(candidates)];
}

function sheetWrite(sheet, rows) {
  if (!rows.length) return;
  const rowCount = rows.length;
  const colCount = rows[0].length;
  const range = sheet.getRangeByIndexes(0, 0, rowCount, colCount);
  range.values = rows;
  range.format.font.bold = false;
}

async function main() {
  const files = (await fs.readdir(sourceDir)).filter((name) => name.endsWith(".json")).sort();

  const summaryRows = [[
    "학교",
    "파일",
    "총페이지",
    "키워드히트페이지",
    "모집인원히트페이지",
    "첫모집인원페이지",
    "첫모집인원스니펫",
    "첫모집인원후보",
    "1차제외",
    "비고",
  ]];

  const detailRows = [[
    "학교",
    "파일",
    "페이지",
    "매칭키워드",
    "스니펫",
    "후보숫자",
    "비고",
  ]];

  const excludedRows = [[
    "학교",
    "파일",
    "이유",
  ]];

  for (const fileName of files) {
    const filePath = path.join(sourceDir, fileName);
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw);
    const school = data.university || path.basename(fileName, ".json");
    const totalPages = data.total_pages ?? data.pages?.length ?? 0;
    const isExcluded = firstPassExclude.has(school);

    if (isExcluded) {
      excludedRows.push([school, fileName, "1차 제외 요청 반영"]);
    }

    const hits = [];
    const mocHits = [];

    for (const page of data.pages ?? []) {
      const pageText = normalizeText(page.text);
      if (!pageText) continue;
      const matchedKeywords = findKeywordHits(pageText);
      if (!matchedKeywords.length) continue;

      const firstIndex = matchedKeywords
        .map((key) => pageText.indexOf(key))
        .filter((idx) => idx >= 0)
        .sort((a, b) => a - b)[0];
      const snippet = snippetAround(pageText, firstIndex >= 0 ? firstIndex : 0);
      const candidateNumbers = extractCandidateNumbers(snippet);

      const detail = {
        school,
        fileName,
        page: page.page,
        matchedKeywords: matchedKeywords.join(", "),
        snippet,
        candidateNumbers: candidateNumbers.join(", "),
      };
      hits.push(detail);
      detailRows.push([
        detail.school,
        detail.fileName,
        detail.page,
        detail.matchedKeywords,
        detail.snippet,
        detail.candidateNumbers,
        "",
      ]);

      if (matchedKeywords.includes("모집인원")) {
        mocHits.push(detail);
      }
    }

    const firstMoc = mocHits[0];
    summaryRows.push([
      school,
      fileName,
      totalPages,
      hits.length,
      mocHits.length,
      firstMoc?.page ?? "",
      firstMoc?.snippet ?? "",
      firstMoc?.candidateNumbers ?? "",
      isExcluded ? "예" : "아니오",
      mocHits.length ? "" : "모집인원 미검출",
    ]);
  }

  const wb = Workbook.create();
  const summarySheet = wb.worksheets.add("요약");
  const detailSheet = wb.worksheets.add("페이지후보");
  const excludedSheet = wb.worksheets.add("제외대상");

  sheetWrite(summarySheet, summaryRows);
  sheetWrite(detailSheet, detailRows);
  sheetWrite(excludedSheet, excludedRows);

  // light formatting
  for (const sheet of [summarySheet, detailSheet, excludedSheet]) {
    const used = sheet.getUsedRange();
    if (used) {
      used.format.wrapText = true;
      used.format.verticalAlignment = "top";
      try {
        used.format.font.size = 11;
      } catch {}
    }
  }

  // Wider columns for readability
  const widthMap = {
    요약: [120, 200, 90, 110, 120, 110, 420, 160, 80, 180],
    페이지후보: [120, 180, 80, 140, 520, 160, 140],
    제외대상: [120, 180, 220],
  };
  const sheetPairs = [
    [summarySheet, widthMap.요약],
    [detailSheet, widthMap.페이지후보],
    [excludedSheet, widthMap.제외대상],
  ];

  for (const [sheet, widths] of sheetPairs) {
    widths.forEach((widthPx, index) => {
      try {
        sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = widthPx;
      } catch {}
    });
    try {
      sheet.getRangeByIndexes(0, 0, 1, widths.length).format.font.bold = true;
    } catch {}
  }

  // compact verification
  const inspectSummary = await wb.inspect({
    kind: "table",
    range: "요약!A1:J8",
    include: "values",
    tableMaxRows: 8,
    tableMaxCols: 10,
  });
  console.log(inspectSummary.ndjson);

  const errorScan = await wb.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 100 },
    summary: "formula error scan",
  });
  console.log(errorScan.ndjson);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const exported = await SpreadsheetFile.exportXlsx(wb);
  await exported.save(outputPath);
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
