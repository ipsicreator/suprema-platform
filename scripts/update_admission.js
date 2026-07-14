const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "data");

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, "")
    .replace(/_/g, "")
    .trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numeric = String(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return numeric ? Number(numeric[0]) : null;
}

function readField(lookup, aliases) {
  for (const alias of aliases) {
    const value = lookup.get(normalizeHeader(alias));
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
}

function buildLookup(row) {
  const lookup = new Map();
  for (const [key, value] of Object.entries(row)) {
    lookup.set(normalizeHeader(key), value);
  }
  return lookup;
}

function latestWorkbookFromArgs() {
  const inputArg = process.argv.slice(2).find((arg) => arg && !arg.startsWith("--"));
  if (inputArg) {
    const resolved = path.resolve(inputArg);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Workbook not found: ${resolved}`);
    }
    return resolved;
  }

  const searchDirs = [path.join(repoRoot, "public"), path.join(repoRoot, "outputs"), repoRoot];
  const workbookPaths = [];
  for (const searchDir of searchDirs) {
    if (!fs.existsSync(searchDir)) continue;
    for (const entry of fs.readdirSync(searchDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".xlsx")) continue;
      if (entry.name.startsWith("~$")) continue;
      workbookPaths.push(path.join(searchDir, entry.name));
    }
  }

  if (workbookPaths.length === 0) {
    throw new Error("No workbook found. Pass the .xlsx path as an argument.");
  }

  workbookPaths.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return workbookPaths[0];
}

function extractRows(workbookPath) {
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error(`No worksheet found in ${workbookPath}`);
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  return rawRows.map((row) => {
    const lookup = buildLookup(row);
    const cutoff26Original = parseNumber(
      readField(lookup, [
        "2026학년도합격(컷)_원본",
        "2026학년도합격(컷)원본",
        "2026학년도합격(등급)_원본",
        "2026학년도합격(등급)원본",
        "2026학년도합격(컷)_원본",
        "2026학년도합격(컷) 원본",
        "2026학년도진입컷_원본",
      ]),
    );
    const cutoff26 = parseNumber(
      readField(lookup, [
        "2026학년도합격(컷)",
        "2026학년도합격(등급)",
        "2026학년도합격(컷)",
        "2026학년도진입컷",
        "2026학년도합격(컷) ",
      ]) ?? cutoff26Original,
    );
    const cutoff26_50 = parseNumber(
      readField(lookup, [
        "합격(50%)",
        "2026학년도합격(50%)",
        "2026학년도합격(50%컷)",
        "합격(50%)",
        "2026학년도합격(50%)",
        "2026학년도진입컷(50%)",
      ]),
    );
    const cutoff26_70 = parseNumber(
      readField(lookup, [
        "합격(70%)",
        "2026학년도합격(70%)",
        "2026학년도합격(70%컷)",
        "합격(70%)",
        "2026학년도합격(70%)",
        "2026학년도진입컷(70%)",
      ]),
    );
    const cutoff25 = parseNumber(
      readField(lookup, [
        "2025학년도합격(컷)",
        "2025학년도합격(등급)",
        "2025학년도합격(컷)",
        "2025학년도진입컷",
      ]),
    );
    const cutoff24 = parseNumber(
      readField(lookup, [
        "2024학년도합격(컷)",
        "2024학년도합격(등급)",
        "2024학년도합격(컷)",
        "2024학년도진입컷",
      ]),
    );

    return {
      region: readField(lookup, ["광역", "region", "areaWide", "광역권"]),
      subRegion: readField(lookup, ["기초", "subRegion", "areaBase", "기초권"]),
      univ: readField(lookup, ["대학교", "univ", "university", "학교명", "??숆탳"]),
      track: readField(lookup, ["계열", "track", "series", "모집계열", "怨꾩뿴"]),
      dept: readField(lookup, ["모집단위명", "모집단위", "dept", "department", "학과", "紐⑥쭛?⑥쐞紐?"]),
      type: readField(lookup, ["전형유형", "type", "admission_type", "?꾪삎?좏삎"]),
      name: readField(lookup, ["전형명", "name", "track_name", "?꾪삎紐?"]),
      req: readField(lookup, ["지원자격", "req", "eligibility"]),
      minRequirement: readField(lookup, ["최저학력기준", "minRequirement", "minimumRequirement"]),
      method: readField(lookup, ["전형방법", "method", "?꾪삎諛⑸쾿"]),
      documents: readField(lookup, ["필요서류", "documents", "requiredDocuments"]),
      duplicateSupport: readField(lookup, ["복수지원", "duplicateSupport", "multipleApply"]),
      gradeRatio: readField(lookup, ["학년별반영비율", "학년별반영 비율", "gradeRatio"]),
      subjects: readField(lookup, ["반영과목", "subjects", "evaluationSubjects"]),
      careerSelectionSubjects: readField(lookup, ["진로선택과목", "careerSelectionSubjects"]),
      resultGradeCompetition: readField(
        lookup,
        ["입시결과등급/경쟁률", "입시결과등급경쟁률", "resultGradeCompetition"],
      ),
      cutoff26,
      cutoff26_50,
      cutoff26_70,
      cutoff26_original: cutoff26Original,
      cutoff25,
      cutoff24,
      competition26: parseNumber(readField(lookup, ["2026학년도경쟁률", "2026학년도 경쟁률"])),
      competition25: parseNumber(readField(lookup, ["2025학년도경쟁률", "2025학년도 경쟁률"])),
      competition24: parseNumber(readField(lookup, ["2024학년도경쟁률", "2024학년도 경쟁률"])),
      reference26: readField(lookup, ["2026학년도기준", "2026학년도 기준", "2026?숇뀈??湲곗?"]),
      reference25: readField(lookup, ["2025학년도기준", "2025학년도 기준", "2025?숇뀈??湲곗?2"]),
      supportNotes: readField(lookup, ["지원시유의사항", "지원시 주의사항", "supportNotes"]),
      verificationStatus: readField(lookup, ["검증상태", "verificationStatus", "寃利앹긽??"]),
      verificationMemo: readField(lookup, ["검증메모", "verificationMemo", "寃利앸찓紐?"]),
      verificationAt: readField(lookup, ["검증일시", "verificationAt", "寃利앹씪??"]),
      remarks: readField(lookup, ["비고", "remarks", "鍮꾧퀬"]),
    };
  });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function writeCsv(filePath, rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const sheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  fs.writeFileSync(filePath, csv, "utf8");
}

function buildDiagnosisCsv(rows) {
  return rows.map((row) => ({
    year: 2026,
    university: row.univ ?? "",
    department: row.dept ?? "",
    admission_type: row.type ?? "",
    track_name: row.name ?? "",
    cutoff_score_50: row.cutoff26_50 ?? row.cutoff26 ?? "",
    cutoff_score_70: row.cutoff26_70 ?? row.cutoff25 ?? "",
  }));
}

function buildCutoffCsv(rows, year) {
  return rows.flatMap((row) => {
    const base = {
      year,
      university: row.univ ?? "",
      department: row.dept ?? "",
      admission_type: row.type ?? "",
      track_name: row.name ?? "",
    };
    const result = [];
    if (row.cutoff26_50 !== null && row.cutoff26_50 !== undefined) {
      result.push({ ...base, percentile_type: 50, cutoff_score: row.cutoff26_50 });
    }
    if (row.cutoff26_70 !== null && row.cutoff26_70 !== undefined) {
      result.push({ ...base, percentile_type: 70, cutoff_score: row.cutoff26_70 });
    }
    return result;
  });
}

function main() {
  const workbookPath = latestWorkbookFromArgs();
  console.log(`Reading workbook: ${workbookPath}`);

  const rows = extractRows(workbookPath);
  const admissionDataPath = path.join(dataDir, "admission", "admissionData.json");
  const diagnosisCsvPath = path.join(dataDir, "susi_explorer_fixed.csv");
  const cutoff2027Path = path.join(dataDir, "admission_cutoffs_2027.csv");

  writeJson(admissionDataPath, rows);
  writeCsv(diagnosisCsvPath, buildDiagnosisCsv(rows));
  writeCsv(cutoff2027Path, buildCutoffCsv(rows, 2027));

  console.log(`Wrote ${rows.length} rows to ${admissionDataPath}`);
  console.log(`Wrote diagnosis CSV to ${diagnosisCsvPath}`);
  console.log(`Wrote 2027 cutoff CSV to ${cutoff2027Path}`);
}

main();
