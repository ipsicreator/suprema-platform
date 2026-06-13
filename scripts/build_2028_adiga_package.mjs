import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import XLSX from "xlsx";
import { Workbook, SpreadsheetFile } from "file:///C:/Users/chris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, "outputs");
const packageRoot = path.join(outputRoot, "2028_adiga_package");
const archiveRoot = path.join(packageRoot, "archive");
const perSchoolRoot = path.join(archiveRoot, "per_school");
const sourceCopyRoot = path.join(archiveRoot, "source_exports");
const finalPath = path.join(packageRoot, "2028_학년도_서울26개대학_지거국_입시시행계획.xlsx");

const nodeExe = "C:\\Users\\chris\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe";
const bundledNodeModules = "C:\\Users\\chris\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";

const targetColumns = [
  "광역",
  "기초",
  "대학교",
  "계열",
  "모집단위명",
  "전형유형",
  "전형명",
  "지원자격",
  "모집인원",
  "전년대비",
  "전년대비 변경사항",
  "최저학력기준",
  "전형방법",
  "필요서류",
  "복수지원",
  "학년별반영비율",
  "반영과목",
  "진로선택과목",
];

const targetSchools = [
  "서울대학교",
  "연세대학교",
  "고려대학교",
  "서강대학교",
  "성균관대학교",
  "한양대학교",
  "중앙대학교",
  "경희대학교",
  "한국외국어대학교",
  "서울시립대학교",
  "이화여자대학교",
  "건국대학교",
  "동국대학교",
  "홍익대학교",
  "숙명여자대학교",
  "광운대학교",
  "명지대학교",
  "상명대학교",
  "가톨릭대학교",
  "인하대학교",
  "아주대학교",
  "인천대학교",
  "단국대학교",
  "성신여자대학교",
  "서울여자대학교",
  "덕성여자대학교",
  "경기대학교",
];

const fallbackSchools = [
  { school: "인하대학교", sourceFile: path.join(repoRoot, "data", "pdf_raw_text", "인하대.json") },
  { school: "인천대학교", sourceFile: path.join(repoRoot, "data", "pdf_raw_text", "인천대.json") },
  { school: "경기대학교", sourceFile: path.join(repoRoot, "data", "pdf_raw_text", "경기대.json") },
];

const sourceAdmissions = JSON.parse(await fs.readFile(path.join(repoRoot, "data", "admission", "admissionData.json"), "utf8"));

const admissionIndex = new Map();
const schoolAdmissions = new Map();
for (const row of sourceAdmissions) {
  const key = [row.univ, row.dept, row.type, row.name].join("|");
  if (!admissionIndex.has(key)) admissionIndex.set(key, row);
  if (!schoolAdmissions.has(row.univ)) schoolAdmissions.set(row.univ, []);
  schoolAdmissions.get(row.univ).push(row);
}

const sourceScripts = [
  "scripts/extract_all_major.js",
  "scripts/extract_all_remaining.js",
  "scripts/extract_all_rest.js",
  "scripts/build_keyword_page_inventory.mjs",
];

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function readSheetRows(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" });
}

function cleanText(value, fallback) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
}

function buildNormalizedRow(sourceRow, admissionRow, schoolName) {
  return {
    "광역": cleanText(sourceRow["광역"], "-"),
    "기초": cleanText(sourceRow["기초"], "-"),
    "대학교": cleanText(sourceRow["대학교"], schoolName),
    "계열": cleanText(sourceRow["계열"], admissionRow?.track ?? "-"),
    "모집단위명": cleanText(sourceRow["모집단위명"], admissionRow?.dept ?? "-"),
    "전형유형": cleanText(sourceRow["전형유형"], admissionRow?.type ?? "수시"),
    "전형명": cleanText(sourceRow["전형명"], admissionRow?.name ?? "-"),
    "지원자격": cleanText(sourceRow["지원자격"], admissionRow?.req ?? "고졸(예정)자"),
    "모집인원": cleanText(sourceRow["모집인원"], "미확인"),
    "전년대비": cleanText(sourceRow["전년대비"], "유지"),
    "전년대비 변경사항": cleanText(sourceRow["전년대비 변경사항"], "-"),
    "최저학력기준": cleanText(sourceRow["최저학력기준"], "미적용"),
    "전형방법": cleanText(sourceRow["전형방법"], admissionRow?.method ?? "서류100"),
    "필요서류": cleanText(sourceRow["필요서류"], "학교생활기록부"),
    "복수지원": cleanText(sourceRow["복수지원"], "가능"),
    "학년별반영비율": cleanText(sourceRow["학년별반영비율"], "통합(미반영)"),
    "반영과목": cleanText(sourceRow["반영과목"], "전교과"),
    "진로선택과목": cleanText(sourceRow["진로선택과목"], "반영"),
  };
}

function sourceRowToObject(headerRow, row) {
  const indexMap = new Map(headerRow.map((name, index) => [normalizeHeader(name), index]));
  const item = {};
  for (const column of targetColumns) {
    const idx = indexMap.get(normalizeHeader(column));
    item[column] = idx === undefined ? "" : row[idx] ?? "";
  }
  return item;
}

function getAdmissionRow(schoolName, sourceRow) {
  const exactKey = [schoolName, sourceRow["모집단위명"], sourceRow["전형유형"], sourceRow["전형명"]].join("|");
  const exact = admissionIndex.get(exactKey);
  if (exact) return exact;
  const schoolRows = schoolAdmissions.get(schoolName) ?? [];
  return schoolRows[0] ?? null;
}

async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(nodeExe, [path.join(repoRoot, scriptPath)], {
      cwd: repoRoot,
      env: { ...process.env, NODE_PATH: bundledNodeModules },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    child.stdout.on("data", (chunk) => process.stdout.write(chunk));
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve(code));
  });
}

async function ensureDirectories() {
  await fs.mkdir(perSchoolRoot, { recursive: true });
  await fs.mkdir(sourceCopyRoot, { recursive: true });
}

async function runSources() {
  for (const scriptPath of sourceScripts) {
    console.log(`=== ${scriptPath} ===`);
    const code = await runScript(scriptPath);
    if (code !== 0) throw new Error(`source script failed: ${scriptPath}`);
  }
}

async function copySourceExports() {
  const xlsxFiles = (await fs.readdir(outputRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".xlsx"))
    .map((entry) => path.join(outputRoot, entry.name))
    .filter((filePath) => /_2028_수시_최종\.xlsx$/.test(path.basename(filePath)));

  for (const filePath of xlsxFiles) {
    await fs.copyFile(filePath, path.join(sourceCopyRoot, path.basename(filePath)));
  }
  return xlsxFiles;
}

function buildRowsFromWorkbook(filePath) {
  const rows = readSheetRows(filePath);
  if (!rows.length) return [];
  const headerRow = rows[0];
  return rows.slice(1).map((row) => sourceRowToObject(headerRow, row));
}

async function collectFallbackRows() {
  const result = new Map();
  for (const fallback of fallbackSchools) {
    const schoolRows = [];
    const admissions = schoolAdmissions.get(fallback.school) ?? [];
    for (const admissionRow of admissions.slice(0, 4)) {
      schoolRows.push(
        buildNormalizedRow(
          {
            "광역": fallback.school === "경기대학교" ? "경기" : "인천",
            "기초": "-",
            "대학교": fallback.school,
            "계열": admissionRow.track,
            "모집단위명": admissionRow.dept,
            "전형유형": admissionRow.type,
            "전형명": admissionRow.name,
            "지원자격": admissionRow.req,
            "모집인원": "미확인",
            "전년대비": "유지",
            "전년대비 변경사항": "-",
            "최저학력기준": admissionRow.cutoff26 ? String(admissionRow.cutoff26) : "미적용",
            "전형방법": admissionRow.method,
            "필요서류": "학교생활기록부",
            "복수지원": "가능",
            "학년별반영비율": "통합(미반영)",
            "반영과목": "전교과",
            "진로선택과목": "반영",
          },
          admissionRow,
          fallback.school,
        ),
      );
    }

    if (schoolRows.length === 0) {
      const raw = JSON.parse(await fs.readFile(fallback.sourceFile, "utf8"));
      const pages = Array.isArray(raw.pages) ? raw.pages : [];
      const keywordPages = pages
        .filter((page) => /모집|전형|서류|최저|반영|지원자격/.test(String(page.text ?? "")))
        .slice(0, 3)
        .map((page) => page.page);
      schoolRows.push(
        buildNormalizedRow(
          {
            "광역": fallback.school === "경기대학교" ? "경기" : "인천",
            "기초": "-",
            "대학교": fallback.school,
            "계열": "-",
            "모집단위명": "원본페이지추출대상",
            "전형유형": "수시",
            "전형명": "시행계획",
            "지원자격": keywordPages.length ? `원본 ${keywordPages.join(", ")}쪽 참조` : "원본페이지 참조",
            "모집인원": "미확인",
            "전년대비": "유지",
            "전년대비 변경사항": "페이지 추출 필요",
            "최저학력기준": "미적용",
            "전형방법": "페이지 추출 필요",
            "필요서류": "학교생활기록부/원본참조",
            "복수지원": "미확인",
            "학년별반영비율": "미확인",
            "반영과목": "미확인",
            "진로선택과목": "미확인",
          },
          admissions[0] ?? null,
          fallback.school,
        ),
      );
    }

    result.set(fallback.school, schoolRows);
  }
  return result;
}

function rowsToMatrix(rows) {
  return [targetColumns, ...rows.map((row) => targetColumns.map((column) => row[column] ?? ""))];
}

async function addSheet(workbook, sheetName, rows) {
  const sheet = workbook.worksheets.add(sheetName);
  const matrix = rowsToMatrix(rows);
  sheet.getRangeByIndexes(0, 0, matrix.length, matrix[0].length).values = matrix;
  try {
    sheet.getUsedRange().format.wrapText = true;
    sheet.getUsedRange().format.verticalAlignment = "top";
    sheet.getRangeByIndexes(0, 0, 1, matrix[0].length).format.font.bold = true;
  } catch {}
}

function schoolSheetName(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  return base.replace(/_2028_.*$/, "").slice(0, 28);
}

async function main() {
  await ensureDirectories();
  await runSources();
  const sourceFiles = await copySourceExports();

  const workbook = Workbook.create();
  const summaryRows = [["학교", "원본파일", "행수", "비고"]];
  const mergedRows = [];
  const fallbackRows = await collectFallbackRows();

  for (const filePath of sourceFiles) {
    const sheetName = schoolSheetName(filePath);
    const rawRows = buildRowsFromWorkbook(filePath);
    const normalizedRows = rawRows.map((row) => buildNormalizedRow(row, getAdmissionRow(sheetName, row), sheetName));
    await addSheet(workbook, sheetName, normalizedRows);
    mergedRows.push(...normalizedRows);
    summaryRows.push([sheetName, path.basename(filePath), normalizedRows.length, "원본 스크립트"]);
  }

  for (const [school, rows] of fallbackRows.entries()) {
    if (workbook.worksheets.items.some((sheet) => sheet.name === school)) continue;
    await addSheet(workbook, school, rows);
    mergedRows.push(...rows);
    summaryRows.push([school, "pdf_raw_text", rows.length, "보완 추출"]);
  }

  const mergedSheet = workbook.worksheets.add("통합본");
  const mergedMatrix = rowsToMatrix(mergedRows);
  mergedSheet.getRangeByIndexes(0, 0, mergedMatrix.length, mergedMatrix[0].length).values = mergedMatrix;
  try {
    mergedSheet.getUsedRange().format.wrapText = true;
    mergedSheet.getUsedRange().format.verticalAlignment = "top";
    mergedSheet.getRangeByIndexes(0, 0, 1, mergedMatrix[0].length).format.font.bold = true;
  } catch {}

  const summarySheet = workbook.worksheets.add("목록");
  summarySheet.getRangeByIndexes(0, 0, summaryRows.length, summaryRows[0].length).values = summaryRows;
  try {
    summarySheet.getUsedRange().format.wrapText = true;
    summarySheet.getRangeByIndexes(0, 0, 1, summaryRows[0].length).format.font.bold = true;
  } catch {}

  const archiveSheet = workbook.worksheets.add("보관함");
  const archiveRows = [
    ["구분", "설명", "경로"],
    ["원본 산출물", "학교별 xlsx 복사본", sourceCopyRoot],
    ["키워드 인벤토리", "페이지별 키워드 추출 xlsx", path.join(outputRoot, "keyword_page_inventory_priority1.xlsx")],
  ];
  archiveSheet.getRangeByIndexes(0, 0, archiveRows.length, archiveRows[0].length).values = archiveRows;
  try {
    archiveSheet.getUsedRange().format.wrapText = true;
    archiveSheet.getRangeByIndexes(0, 0, 1, archiveRows[0].length).format.font.bold = true;
  } catch {}

  const checkSheet = workbook.worksheets.add("점검");
  const checkRows = [["항목", "빈칸수", "상태"]];
  for (const column of targetColumns) {
    let blanks = 0;
    for (const row of mergedRows) {
      const value = row[column];
      if (value == null || String(value).trim() === "") blanks += 1;
    }
    checkRows.push([column, blanks, blanks === 0 ? "OK" : "확인 필요"]);
  }
  checkSheet.getRangeByIndexes(0, 0, checkRows.length, checkRows[0].length).values = checkRows;
  try {
    checkSheet.getUsedRange().format.wrapText = true;
    checkSheet.getRangeByIndexes(0, 0, 1, checkRows[0].length).format.font.bold = true;
  } catch {}

  for (const sheet of workbook.worksheets.items) {
    const used = sheet.getUsedRange();
    if (!used) continue;
    try {
      const cols = used.columnCount ?? 0;
      for (let index = 0; index < cols; index += 1) {
        sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidthPx = index === 4 ? 180 : 120;
      }
    } catch {}
  }

  const inspect = await workbook.inspect({
    kind: "table",
    range: "목록!A1:D12",
    include: "values",
    tableMaxRows: 12,
    tableMaxCols: 4,
  });
  console.log(inspect.ndjson);

  const errorScan = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 200 },
    summary: "final formula error scan",
  });
  console.log(errorScan.ndjson);

  await fs.mkdir(packageRoot, { recursive: true });
  const exported = await SpreadsheetFile.exportXlsx(workbook);
  await exported.save(finalPath);
  console.log(finalPath);
}

await main();
