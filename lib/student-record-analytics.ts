type ParsedSubject = {
  subject: string;
  unit?: number;
  grade?: number;
  year?: number;
  semester?: number;
  rawScore?: number;
  scoreAverage?: number;
  achievement?: string;
  studentCount?: number;
};

type StudentAnalysis = {
  keyKeywords?: string[];
  academicCapacity?: string;
  seTeukAnalysis?: string;
  comprehensiveOpinion?: string;
  majorSuitability?: string;
};

export type TermSummaryRow = {
  key: string;
  label: string;
  subjectCount: number;
  averageGrade: number | null;
  bestSubject: string;
};

export type CoreSubjectCheck = {
  group: string;
  required: string[];
  optional: string[];
  completedRequired: string[];
  missingRequired: string[];
  completedOptional: string[];
  status: "충족" | "부분 충족" | "보완 필요";
};

export type CompetencyScore = {
  label: "학업역량" | "전공적합성" | "공동체역량";
  score: number;
  level: "A" | "B" | "C" | "D";
};

const ENGINEERING_CORE = [
  { group: "수학", required: ["수학Ⅰ", "수학Ⅱ"], optional: ["미적분", "확률과 통계", "기하"] },
  { group: "과학", required: ["통합과학"], optional: ["물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ", "지구과학Ⅰ"] },
  { group: "정보", required: [], optional: ["정보"] },
];

const HUMANITIES_CORE = [
  { group: "국어", required: ["국어"], optional: ["문학", "독서", "언어와 매체", "화법과 작문"] },
  { group: "사회", required: ["통합사회"], optional: ["한국지리", "생활과 윤리", "사회문화", "경제", "정치와 법"] },
  { group: "영어", required: ["영어"], optional: ["영어Ⅰ", "영어Ⅱ"] },
];

function normalizeSubject(subject: string) {
  return subject.replace(/\s+/g, "").replace(/Ⅰ/g, "I").replace(/Ⅱ/g, "II");
}

function includesSubject(subjects: string[], target: string) {
  const normalizedTarget = normalizeSubject(target);
  return subjects.some((subject) => normalizeSubject(subject).includes(normalizedTarget));
}

export function buildTermSummary(subjects: ParsedSubject[]): TermSummaryRow[] {
  const map = new Map<string, ParsedSubject[]>();

  for (const item of subjects) {
    const key = `${item.year ?? 0}-${item.semester ?? 0}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, rows]) => {
      const validGrades = rows.filter((row) => typeof row.grade === "number");
      const averageGrade =
        validGrades.length > 0
          ? Number(
              (
                validGrades.reduce((sum, row) => sum + Number(row.grade || 0), 0) /
                validGrades.length
              ).toFixed(2),
            )
          : null;
      const best = [...validGrades].sort((a, b) => Number(a.grade ?? 99) - Number(b.grade ?? 99))[0];

      return {
        key,
        label: `${rows[0]?.year ?? "-"}학년 · ${rows[0]?.semester ?? "-"}학기`,
        subjectCount: rows.length,
        averageGrade,
        bestSubject: best?.subject || "-",
      };
    });
}

export function buildCoreSubjectChecks(subjects: ParsedSubject[], supportTrack?: string, careerHint?: string) {
  const subjectNames = subjects.map((item) => item.subject);
  const useEngineering =
    /자연|공학|의약|컴퓨터|ai|인공지능|데이터|소프트웨어|반도체|환경|기계|전자/i.test(
      `${supportTrack || ""} ${careerHint || ""}`,
    );

  const groups = useEngineering ? ENGINEERING_CORE : HUMANITIES_CORE;

  return groups.map((group): CoreSubjectCheck => {
    const completedRequired = group.required.filter((item) => includesSubject(subjectNames, item));
    const missingRequired = group.required.filter((item) => !includesSubject(subjectNames, item));
    const completedOptional = group.optional.filter((item) => includesSubject(subjectNames, item));

    let status: CoreSubjectCheck["status"] = "보완 필요";
    if (missingRequired.length === 0 && completedOptional.length > 0) status = "충족";
    else if (completedRequired.length > 0 || completedOptional.length > 0) status = "부분 충족";

    return {
      group: group.group,
      required: group.required,
      optional: group.optional,
      completedRequired,
      missingRequired,
      completedOptional,
      status,
    };
  });
}

function toLevel(score: number): CompetencyScore["level"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

export function buildCompetencyScores(subjects: ParsedSubject[], analysis?: StudentAnalysis): CompetencyScore[] {
  const grades = subjects.filter((item) => typeof item.grade === "number").map((item) => Number(item.grade));
  const average = grades.length > 0 ? grades.reduce((sum, value) => sum + value, 0) / grades.length : 9;
  const academicScore = Math.max(35, Math.min(98, Math.round(100 - average * 12)));
  const keywordCount = analysis?.keyKeywords?.length || 0;
  const majorScore = Math.max(40, Math.min(96, academicScore - 5 + keywordCount * 4 + (analysis?.majorSuitability ? 8 : 0)));
  const communityScore = Math.max(
    45,
    Math.min(95, 55 + (analysis?.comprehensiveOpinion ? 15 : 0) + (analysis?.seTeukAnalysis ? 10 : 0)),
  );

  return [
    { label: "학업역량", score: academicScore, level: toLevel(academicScore) },
    { label: "전공적합성", score: majorScore, level: toLevel(majorScore) },
    { label: "공동체역량", score: communityScore, level: toLevel(communityScore) },
  ];
}

export function buildTrendData(subjects: ParsedSubject[]) {
  const map = new Map<string, { totalGrade: number; count: number }>();
  for (const subject of subjects) {
    if (typeof subject.grade === "number" && subject.year && subject.semester) {
      const key = `${subject.year}-${subject.semester}`;
      const entry = map.get(key) || { totalGrade: 0, count: 0 };
      entry.totalGrade += subject.grade;
      entry.count += 1;
      map.set(key, entry);
    }
  }

  return [...map.entries()].sort().map(([key, data]) => ({
    label: `${key.split('-')[0]}학년 ${key.split('-')[1]}학기`,
    grade: Number((data.totalGrade / data.count).toFixed(2)),
  }));
}

export function buildSubjectGroupRadarData(subjects: ParsedSubject[]) {
  const groups = {
    국어: { total: 0, count: 0 },
    수학: { total: 0, count: 0 },
    영어: { total: 0, count: 0 },
    사회: { total: 0, count: 0 },
    과학: { total: 0, count: 0 },
  };

  for (const subject of subjects) {
    if (typeof subject.grade !== "number") continue;
    const name = subject.subject || "";
    if (name.includes("국어") || name.includes("문학") || name.includes("독서") || name.includes("언어") || name.includes("화법")) {
      groups.국어.total += subject.grade; groups.국어.count++;
    } else if (name.includes("수학") || name.includes("미적분") || name.includes("기하") || name.includes("확률")) {
      groups.수학.total += subject.grade; groups.수학.count++;
    } else if (name.includes("영어")) {
      groups.영어.total += subject.grade; groups.영어.count++;
    } else if (name.includes("사회") || name.includes("역사") || name.includes("도덕") || name.includes("지리") || name.includes("경제") || name.includes("정치")) {
      groups.사회.total += subject.grade; groups.사회.count++;
    } else if (name.includes("과학") || name.includes("물리") || name.includes("화학") || name.includes("생명") || name.includes("지구")) {
      groups.과학.total += subject.grade; groups.과학.count++;
    }
  }

  return Object.entries(groups).map(([group, data]) => {
    const avgGrade = data.count > 0 ? data.total / data.count : null;
    const score = avgGrade !== null ? (10 - avgGrade).toFixed(1) : 0;
    return {
      subject: group,
      score: Number(score),
      rawGrade: avgGrade ? Number(avgGrade.toFixed(2)) : null,
    };
  });
}

export function buildDistributionData(subjects: ParsedSubject[]) {
  return subjects
    .filter((s) => typeof s.rawScore === "number" && typeof s.scoreAverage === "number")
    .map((s) => ({
      subject: s.subject,
      rawScore: s.rawScore!,
      scoreAverage: s.scoreAverage!,
      diff: Number((s.rawScore! - s.scoreAverage!).toFixed(1)),
    }))
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 10);
}

