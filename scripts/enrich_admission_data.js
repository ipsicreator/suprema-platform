const fs = require("fs");
const path = require("path");

const repoRoot = process.cwd();
const admissionPath = path.join(repoRoot, "data", "admission", "admissionData.json");
const guidesPath = path.join(repoRoot, "data", "university_guides.json");

const admissionData = JSON.parse(fs.readFileSync(admissionPath, "utf8"));
const guides = JSON.parse(fs.readFileSync(guidesPath, "utf8"));

function normalize(value) {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .replace(/[()]/g, "")
    .trim();
}

function findGuide(univ) {
  const normalized = normalize(univ);
  const universities = guides?.universities || {};
  for (const [key, value] of Object.entries(universities)) {
    const guideKey = normalize(key);
    if (!guideKey) continue;
    if (normalized.includes(guideKey) || guideKey.includes(normalized)) {
      return value;
    }
  }
  return null;
}

function chooseSummary(guide) {
  if (!guide) return "학교 요강 참조";
  if (Array.isArray(guide.official_guide_summary) && guide.official_guide_summary.length > 0) {
    return guide.official_guide_summary[0];
  }
  return guide.description || "학교 요강 참조";
}

const enriched = admissionData.map((row) => {
  const guide = findGuide(row.univ);
  const summary = chooseSummary(guide);
  return {
    ...row,
    minRequirement: row.minRequirement || "요강 참조",
    documents: row.documents || "요강 참조",
    duplicateSupport: row.duplicateSupport || "요강 참조",
    gradeRatio: row.gradeRatio || "요강 참조",
    subjects: row.subjects || "요강 참조",
    careerSelectionSubjects: row.careerSelectionSubjects || "요강 참조",
    resultGradeCompetition: row.resultGradeCompetition || summary,
    supportNotes: row.supportNotes || summary,
    reference26: row.reference26 || (guide?.official_guide_summary || []).join(" / ") || "",
  };
});

fs.writeFileSync(admissionPath, JSON.stringify(enriched, null, 2), "utf8");
console.log(`Updated ${admissionPath} with fallback guide text.`);
