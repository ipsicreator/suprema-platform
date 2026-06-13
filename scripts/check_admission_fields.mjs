import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const admissionPath = path.join(repoRoot, "data", "admission", "admissionData.json");
const data = JSON.parse(await fs.readFile(admissionPath, "utf8"));

const schools = ["인하대학교", "인천대학교", "경기대학교"];
const report = [];

for (const school of schools) {
  const rows = data.filter((row) => row.univ === school);
  const keySet = new Set();
  for (const row of rows.slice(0, 50)) {
    for (const key of Object.keys(row)) keySet.add(key);
  }
  report.push({
    school,
    count: rows.length,
    keys: [...keySet].sort(),
    sample: rows[0] ?? null,
  });
}

const outPath = path.join(repoRoot, "outputs", "admission_fields_report.json");
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(report, null, 2), "utf8");
console.log(outPath);
