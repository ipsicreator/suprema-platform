import fs from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, "outputs");
const packageRoot = path.join(outputRoot, "2028_adiga_package");
const archiveRoot = path.join(packageRoot, "archive");
const sourceExportRoot = path.join(archiveRoot, "source_exports");
const finalPath = path.join(packageRoot, "2028_학년도_서울26개대학_지거국_입시시행계획.xlsx");

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

const columns = [
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

const admissionData = JSON.parse(
  await fs.readFile(path.join(repoRoot, "data", "admission", "admissionData.json"), "utf8"),
);

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .trim();
}

function text(value, fallback = "미확인") {
  const result = String(value ?? "").trim();
  return result.length > 0 ? result : fallback;
}

function rowKey(row) {
  return [
    row["대학교"] ?? "",
    row["모집단위명"] ?? "",
    row["전형명"] ?? "",
    row["계열"] ?? "",
  ]
    .map(normalize)
    .join("|");
}

function headerIndexMap(headerRow) {
  const map = new Map();
  headerRow.forEach((name, index) => {
    map.set(normalize(name), index);
  });
  return map;
}

function readWorkbookRows(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" });
}

function sourceRowToFields(headerRow, row) {
  const indexMap = headerIndexMap(headerRow);
  const get = (...names) => {
    for (const name of names) {
      const index = indexMap.get(normalize(name));
      if (index !== undefined) {
        const value = row[index];
        if (value !== undefined && value !== null && String(value).trim().length > 0) {
          return String(value).trim();
        }
      }
    }
    return "";
  };

  return {
    "광역": get("광역", "region"),
    "기초": get("기초", "subRegion"),
    "대학교": get("대학교", "univ", "university"),
    "계열": get("계열", "category", "track"),
    "모집단위명": get("모집단위명", "dept", "department"),
    "전형유형": get("전형유형", "type", "admission_type"),
    "전형명": get("전형명", "name", "track_name"),
    "지원자격": get("지원자격", "req"),
    "모집인원": get("모집인원", "quota", "모집인원수"),
    "전년대비": get("전년대비"),
    "전년대비 변경사항": get("전년대비 변경사항"),
    "최저학력기준": get("최저학력기준", "minimum"),
    "전형방법": get("전형방법", "method"),
    "필요서류": get("필요서류"),
    "복수지원": get("복수지원"),
    "학년별반영비율": get("학년별반영비율"),
    "반영과목": get("반영과목"),
    "진로선택과목": get("진로선택과목"),
  };
}

async function collectSourceRows() {
  const lookup = new Map();
  const sourceFiles = [];
  const roots = [sourceExportRoot, outputRoot];
  for (const root of roots) {
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith(".xlsx")) continue;
        if (entry.name.includes("2028_학년도_서울26개대학_지거국_입시시행계획")) continue;
        if (entry.name.includes("keyword_page_inventory")) continue;
        const filePath = path.join(root, entry.name);
        sourceFiles.push(filePath);
      }
    } catch {
      // ignore missing roots
    }
  }

  const seen = new Set();
  for (const filePath of sourceFiles.sort()) {
    const base = path.basename(filePath);
    if (seen.has(base)) continue;
    seen.add(base);
    const rows = readWorkbookRows(filePath);
    if (!rows.length) continue;
    const headerRow = rows[0];
    for (const row of rows.slice(1)) {
      const fields = sourceRowToFields(headerRow, row);
      const key = rowKey(fields);
      const looseKey = [
        fields["대학교"] ?? "",
        fields["모집단위명"] ?? "",
        fields["전형명"] ?? "",
      ]
        .map(normalize)
        .join("|");
      if (!key || key === "|||") continue;
      if (!lookup.has(key)) lookup.set(key, fields);
      if (looseKey && !lookup.has(looseKey)) lookup.set(looseKey, fields);
      const school = fields["대학교"];
      if (school && !lookup.has(`school:${normalize(school)}`)) {
        lookup.set(`school:${normalize(school)}`, []);
      }
      if (school) {
        const schoolKey = `school:${normalize(school)}`;
        lookup.get(schoolKey).push(fields);
      }
    }
  }
  return lookup;
}

function buildRow(admissionRow, sourceRow) {
  const school = admissionRow.univ;
  return {
    "광역": text(admissionRow.region, "-"),
    "기초": text(admissionRow.subRegion, "-"),
    "대학교": school,
    "계열": text(admissionRow.track, "-"),
    "모집단위명": text(admissionRow.dept, "-"),
    "전형유형": text(admissionRow.type, "-"),
    "전형명": text(admissionRow.name, "-"),
    "지원자격": text(sourceRow?.["지원자격"] || admissionRow.req, "미확인"),
    "모집인원": text(sourceRow?.["모집인원"], "미확인"),
    "전년대비": text(sourceRow?.["전년대비"], "미확인"),
    "전년대비 변경사항": text(sourceRow?.["전년대비 변경사항"], "미확인"),
    "최저학력기준": text(sourceRow?.["최저학력기준"], admissionRow.cutoff26 ?? "미확인"),
    "전형방법": text(sourceRow?.["전형방법"] || admissionRow.method, "미확인"),
    "필요서류": text(sourceRow?.["필요서류"], "미확인"),
    "복수지원": text(sourceRow?.["복수지원"], "미확인"),
    "학년별반영비율": text(sourceRow?.["학년별반영비율"], "미확인"),
    "반영과목": text(sourceRow?.["반영과목"], "미확인"),
    "진로선택과목": text(sourceRow?.["진로선택과목"], "미확인"),
  };
}

function toSheetData(rows) {
  return [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ""))];
}

function addSheet(workbook, sheetName, rows) {
  const sheet = XLSX.utils.aoa_to_sheet(toSheetData(rows));
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
}

function schoolSheetName(school) {
  return school;
}

async function main() {
  await fs.mkdir(packageRoot, { recursive: true });
  await fs.mkdir(archiveRoot, { recursive: true });

  const sourceLookup = await collectSourceRows();
  const workbook = XLSX.utils.book_new();
  const mergedRows = [];
  const summaryRows = [];
  const archiveRows = [];
  const checkRows = [["학교", "expected_rows", "actual_rows", "missing_quota_rows", "status"]];

  for (const school of targetSchools) {
    const admissions = admissionData.filter((row) => row.univ === school);
    const schoolSourceRows = sourceLookup.get(`school:${normalize(school)}`) ?? [];

    const matchedRows = admissions.map((admissionRow) => {
      const exactKey = rowKey({
        "대학교": admissionRow.univ,
        "모집단위명": admissionRow.dept,
        "전형명": admissionRow.name,
        "계열": admissionRow.track,
      });
      const exactSource = sourceLookup.get(exactKey);
      if (exactSource) return buildRow(admissionRow, exactSource);

      const looseKey = [
        admissionRow.univ,
        admissionRow.dept,
        admissionRow.name,
      ]
        .map(normalize)
        .join("|");
      const looseSource = sourceLookup.get(looseKey);
      if (looseSource) return buildRow(admissionRow, looseSource);

      const fallbackSource =
        schoolSourceRows.find(
          (candidate) =>
            normalize(candidate["모집단위명"]) === normalize(admissionRow.dept) &&
            normalize(candidate["전형명"]) === normalize(admissionRow.name),
        ) ?? null;
      return buildRow(admissionRow, fallbackSource);
    });

    const missingQuotaRows = matchedRows.filter((row) => row["모집인원"] === "미확인").length;
    checkRows.push([
      school,
      admissions.length,
      matchedRows.length,
      missingQuotaRows,
      admissions.length === matchedRows.length ? "OK" : "MISMATCH",
    ]);

    addSheet(workbook, schoolSheetName(school), matchedRows);
    mergedRows.push(...matchedRows);
    summaryRows.push({
      학교: school,
      모집단위수: matchedRows.length,
      모집인원미확인수: missingQuotaRows,
    });
    archiveRows.push({
      학교: school,
      모집단위수: matchedRows.length,
      원본행수: admissions.length,
      모집인원미확인수: missingQuotaRows,
    });
  }

  addSheet(workbook, "통합본", mergedRows);

  const listSheet = XLSX.utils.aoa_to_sheet([
    ["학교", "모집단위수", "모집인원미확인수"],
    ...summaryRows.map((row) => [row.학교, row.모집단위수, row.모집인원미확인수]),
  ]);
  XLSX.utils.book_append_sheet(workbook, listSheet, "목록");

  const archiveSheet = XLSX.utils.aoa_to_sheet([
    ["학교", "모집단위수", "원본행수", "모집인원미확인수"],
    ...archiveRows.map((row) => [row.학교, row.모집단위수, row.원본행수, row.모집인원미확인수]),
  ]);
  XLSX.utils.book_append_sheet(workbook, archiveSheet, "보관함");

  const checkSheet = XLSX.utils.aoa_to_sheet(checkRows);
  XLSX.utils.book_append_sheet(workbook, checkSheet, "점검");

  XLSX.writeFile(workbook, finalPath);
  console.log(`written ${finalPath}`);
}

await main();
