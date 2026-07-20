export interface StudentRecordSubject {
  subject: string;
  unit?: number;
  grade?: number;
  year?: number;
  semester?: number;
  rawScore?: number;
  scoreAverage?: number;
  achievement?: string;
  studentCount?: number;
  originalLine?: string;
}

export interface StudentRecordSection {
  title: string;
  rawText: string;
  items: string[];
}

export interface StudentRecordStructured {
  schoolInfo: StudentRecordSection;
  curriculum: StudentRecordSection;
  grades: StudentRecordSection;
  sepec: StudentRecordSection;
  creativeActivities: StudentRecordSection;
  behaviorSummary: StudentRecordSection;
}

export interface StudentAnalysisSummary {
  majorSuitability?: string;
  majorField?: string;
  keyKeywords?: string[];
  academicCapacity?: string;
  seTeukAnalysis?: string;
  comprehensiveOpinion?: string;
}

const K = {
  SCHOOL_INFO: "\uC778\uC801\u00B7\uD559\uC801\uC0AC\uD56D",
  CURRICULUM: "\uAD50\uC721\uACFC\uC815 \uC774\uC218 \uB0B4\uC5ED",
  GRADES: "\uAD50\uACFC\uD559\uC2B5\uBC1C\uB2EC\uC0C1\uD669",
  SEPEC: "\uC138\uBD80\uB2A5\uB825 \uBC0F \uD2B9\uAE30\uC0AC\uD56D",
  CREATIVE: "\uCC3D\uC758\uC801 \uCCB4\uD5D8\uD65C\uB3D9",
  BEHAVIOR: "\uD589\uB3D9\uD2B9\uC131 \uBC0F \uC885\uD569\uC758\uACAC",
  AVG_PREFIX: "\uD3C9\uADE0\uB4F1\uAE09",
  AVG_SUFFIX: "\uAE30\uC900 \uC815\uB9AC",
  ACADEMIC: "\uAD50\uACFC\uD559\uC2B5\uBC1C\uB2EC\uC0C1\uD669\uC5D0\uC11C \uACFC\uBAA9\u00B7\uD559\uAE30\u00B7\uB4F1\uAE09 \uCD94\uCD9C",
  SETEUK: "\uC138\uBD80\uB2A5\uB825 \uBC0F \uD2B9\uAE30\uC0AC\uD56D \uC6D0\uBB38 \uAD6C\uAC04 \uCD94\uCD9C",
  OPINION: "\uD589\uB3D9\uD2B9\uC131 \uBC0F \uC885\uD569\uC758\uACAC \uC6D0\uBB38 \uAD6C\uAC04 \uCD94\uCD9C",
} as const;

const SECTION_PATTERNS = {
  schoolInfo: [
    "1. \uC778\uC801\u00B7\uD559\uC801\uC0AC\uD56D",
    "\uC778\uC801\u00B7\uD559\uC801\uC0AC\uD56D",
    "\uD559\uC0DD\uC815\uBCF4",
    "\uD559\uC801\uC0AC\uD56D",
    "\uD559\uAD50 \uC815\uBCF4",
  ],
  curriculum: [
    "\uAD50\uC721\uACFC\uC815",
    "\uC774\uC218 \uACFC\uBAA9",
    "\uC774\uC218\uB0B4\uC5ED",
    "\uAD50\uC721\uACFC\uC815 \uC774\uC218",
    "\uC9C4\uB85C \uC120\uD0DD \uACFC\uBAA9",
  ],
  grades: [
    "7. \uAD50\uACFC\uD559\uC2B5\uBC1C\uB2EC\uC0C1\uD669",
    "\uAD50\uACFC\uD559\uC2B5\uBC1C\uB2EC\uC0C1\uD669",
  ],
  sepec: [
    "\uC138\uBD80\uB2A5\uB825 \uBC0F \uD2B9\uAE30\uC0AC\uD56D",
    "\uC138\uBD80\uB2A5\uB825 \uBC0F \uD2B9\uAE30\uC0AC\uD56D",
    "\uC138\uBD80\uB2A5\uB825",
    "\uD2B9\uAE30\uC0AC\uD56D",
    "\uC138\uD2B9",
  ],
  creativeActivities: [
    "6. \uCC3D\uC758\uC801 \uCCB4\uD5D8\uD65C\uB3D9\uC0C1\uD669",
    "\uCC3D\uC758\uC801 \uCCB4\uD5D8\uD65C\uB3D9\uC0C1\uD669",
    "\uCC3D\uC758\uC801 \uCCB4\uD5D8\uD65C\uB3D9",
    "\uCC3D\uCCB4",
    "\uC790\uC728\uD65C\uB3D9",
    "\uB3D9\uC544\uB9AC\uD65C\uB3D9",
    "\uC9C4\uB85C\uD65C\uB3D9",
    "\uBD09\uC0AC\uD65C\uB3D9",
  ],
  behaviorSummary: [
    "\uD589\uB3D9\uD2B9\uC131 \uBC0F \uC885\uD569\uC758\uACAC",
    "\uD589\uB3D9\uD2B9\uC131",
    "\uC885\uD569\uC758\uACAC",
    "\uD589\uD2B9",
  ],
} as const;

function normalizeText(value: string) {
  return value.replace(/\r/g, "").replace(/\u0000/g, "").trim();
}

function splitLines(text: string) {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findSectionIndices(lines: string[]) {
  const entries = Object.entries(SECTION_PATTERNS).flatMap(([key, patterns]) =>
    patterns.map((pattern) => ({
      key: key as keyof StudentRecordStructured,
      index: lines.findIndex((line) => line.includes(pattern)),
    })),
  );

  const sorted = entries
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index);

  const seen = new Set<keyof StudentRecordStructured>();
  return sorted.filter((entry) => {
    if (seen.has(entry.key)) return false;
    seen.add(entry.key);
    return true;
  });
}

function emptySection(title: string): StudentRecordSection {
  return { title, rawText: "", items: [] };
}

function extractSectionBlock(
  lines: string[],
  found: ReturnType<typeof findSectionIndices>,
  targetKey: keyof StudentRecordStructured,
  title: string,
): StudentRecordSection {
  const currentIndex = found.findIndex((entry) => entry.key === targetKey);
  if (currentIndex < 0) return emptySection(title);

  const current = found[currentIndex];
  const next = found[currentIndex + 1];
  const blockLines = lines.slice(current.index, next ? next.index : lines.length);

  return {
    title,
    rawText: blockLines.join("\n"),
    items: blockLines.slice(1).filter(Boolean),
  };
}

export function extractStructuredStudentRecord(text: string): StudentRecordStructured {
  const lines = splitLines(text);
  const found = findSectionIndices(lines);

  return {
    schoolInfo: extractSectionBlock(lines, found, "schoolInfo", K.SCHOOL_INFO),
    curriculum: extractSectionBlock(lines, found, "curriculum", K.CURRICULUM),
    grades: extractSectionBlock(lines, found, "grades", K.GRADES),
    sepec: extractSectionBlock(lines, found, "sepec", K.SEPEC),
    creativeActivities: extractSectionBlock(lines, found, "creativeActivities", K.CREATIVE),
    behaviorSummary: extractSectionBlock(lines, found, "behaviorSummary", K.BEHAVIOR),
  };
}

export function summarizeStudentRecord(
  subjects: StudentRecordSubject[],
  structured: StudentRecordStructured,
): StudentAnalysisSummary {
  const average = subjects.length
    ? subjects.reduce((sum, item) => sum + Number(item.grade || 0), 0) / subjects.length
    : 0;

  const keywordPool = [
    ...structured.sepec.items,
    ...structured.creativeActivities.items,
    ...structured.behaviorSummary.items,
  ]
    .join(" ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((item) => item.length >= 2);

  const frequency = new Map<string, number>();
  for (const token of keywordPool) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  const keyKeywords = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);

  return {
    majorSuitability: average > 0 ? `${K.AVG_PREFIX} ${average.toFixed(2)} ${K.AVG_SUFFIX}` : undefined,
    keyKeywords,
    academicCapacity: structured.grades.items.length ? K.ACADEMIC : undefined,
    seTeukAnalysis: structured.sepec.items.length ? K.SETEUK : undefined,
    comprehensiveOpinion: structured.behaviorSummary.items.length ? K.OPINION : undefined,
  };
}
