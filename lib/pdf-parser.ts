import zlib from "zlib";

export interface ExtractedSubject {
  subject: string;
  unit: number;
  grade: number;
  year?: number;
  semester?: number;
  rawScore?: number;
  scoreAverage?: number;
  achievementLevel?: string;
  studentCount?: number;
}

export interface PDFAnalysisResult {
  gpa: number;
  subjects: ExtractedSubject[];
  message: string;
  success: boolean;
  studentAnalysis?: Record<string, unknown>;
}

type StudentAnalysisPayload = {
  majorSuitability: string;
  majorField: string;
  keyKeywords: string[];
  academicCapacity: string;
  activityAutonomous: string;
  activityClub: string;
  activityCareer: string;
  seTeukAnalysis: string;
  comprehensiveOpinion: string;
};

const SUBJECT_KEYWORDS = [
  "국어",
  "수학",
  "영어",
  "한국사",
  "사회",
  "과학",
  "통합사회",
  "통합과학",
  "정보",
  "기술",
  "미술",
  "음악",
  "체육",
  "진로",
  "한문",
  "독서",
  "문학",
  "화법",
  "작문",
  "확률과통계",
  "미적분",
  "기하",
];

const TRANSCRIPT_SUBJECT_PATTERNS = [
  { source: "공통국어", subject: "공통국어" },
  { source: "공통수학", subject: "공통수학" },
  { source: "공통영어", subject: "공통영어" },
  { source: "한국사", subject: "한국사" },
  { source: "통합사회", subject: "통합사회" },
  { source: "통합과학", subject: "통합과학" },
  { source: "정보", subject: "정보" },
  { source: "기술·가정", subject: "기술·가정" },
];

const KEYWORD_CANDIDATES = [
  "생명과학",
  "생명윤리",
  "DNA",
  "전기영동",
  "신약 개발",
  "약물 개발",
  "데이터 편향",
  "데이터 분석",
  "인지신경과학",
  "LMO",
  "크리스퍼",
  "유전자",
  "인권",
  "윤리",
  "탐구",
  "발표",
  "실험",
];

export function extractTextFromPDFBuffer(buffer: Buffer): string {
  let text = "";
  let pos = 0;

  while (pos < buffer.length) {
    const streamIdx = buffer.indexOf("stream", pos);
    if (streamIdx === -1) break;

    const endstreamIdx = buffer.indexOf("endstream", streamIdx);
    if (endstreamIdx === -1) break;

    let streamData = buffer.subarray(streamIdx + 6, endstreamIdx);

    if (streamData[0] === 0x0d && streamData[1] === 0x0a) {
      streamData = streamData.subarray(2);
    } else if (streamData[0] === 0x0a) {
      streamData = streamData.subarray(1);
    }

    if (streamData[streamData.length - 1] === 0x0a) {
      streamData = streamData.subarray(0, streamData.length - 1);
    }
    if (streamData[streamData.length - 1] === 0x0d) {
      streamData = streamData.subarray(0, streamData.length - 1);
    }

    try {
      const decompressed = zlib.inflateSync(streamData);
      const decompressedText = decompressed.toString("binary");

      const parenRegex = /\(([^)]*)\)\s*Tj/g;
      let match: RegExpExecArray | null;
      while ((match = parenRegex.exec(decompressedText)) !== null) {
        text += match[1] + " ";
      }

      const tjRegex = /\[(.*?)\]\s*TJ/g;
      while ((match = tjRegex.exec(decompressedText)) !== null) {
        const content = match[1];
        const innerParenRegex = /\(([^)]*)\)/g;
        let innerMatch: RegExpExecArray | null;
        while ((innerMatch = innerParenRegex.exec(content)) !== null) {
          text += innerMatch[1] + " ";
        }
      }

      const hexRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
      while ((match = hexRegex.exec(decompressedText)) !== null) {
        try {
          const buf = Buffer.from(match[1], "hex");
          for (let i = 0; i < buf.length; i += 2) {
            const temp = buf[i];
            buf[i] = buf[i + 1];
            buf[i + 1] = temp;
          }
          text += buf.toString("utf16le") + " ";
        } catch {}
      }
    } catch {}

    pos = endstreamIdx + 9;
  }

  return text;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueSubjects(items: ExtractedSubject[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.subject}-${item.unit}-${item.grade}-${item.year ?? 0}-${item.semester ?? 0}-${item.rawScore ?? 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractTranscriptRows(lines: string[], gradingSystem: "5-level" | "9-level") {
  const extracted: ExtractedSubject[] = [];
  const maxGrade = gradingSystem === "5-level" ? 5 : 9;
  let currentYear: number | undefined;
  let currentSemester: number | undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();
    if (!line) continue;

    const yearMatch = line.match(/\[?([1-3])학년\]?/);
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1], 10);
      continue;
    }

    if (/^[12]$/.test(line)) {
      currentSemester = parseInt(line, 10);
      continue;
    }

    const compact = line.replace(/\s+/g, "");

    for (const pattern of TRANSCRIPT_SUBJECT_PATTERNS) {
      const splitLineRegex = new RegExp(`${escapeRegExp(pattern.source)}(\\d{3,4})\\/(\\d{2,3}(?:\\.\\d)?)([A-E])$`);
      const splitLineMatch = compact.match(splitLineRegex);
      if (splitLineMatch) {
        const digitBlock = splitLineMatch[1];
        const trimmedBlock =
          digitBlock.length === 4 && currentSemester && digitBlock.startsWith(String(currentSemester))
            ? digitBlock.slice(1)
            : digitBlock;

        const tailLine = [lines[index + 1], lines[index + 2], lines[index + 3], lines[index + 4]]
          .map((item) => (item || "").trim())
          .find((item) => /^\d{4}$/.test(item));

        if (trimmedBlock.length === 3 && tailLine) {
          extracted.push({
            subject: pattern.subject,
            unit: parseInt(trimmedBlock[0], 10),
            rawScore: parseInt(trimmedBlock.slice(1), 10),
            scoreAverage: parseFloat(splitLineMatch[2]),
            achievementLevel: splitLineMatch[3],
            grade: parseInt(tailLine[0], 10),
            studentCount: parseInt(tailLine.slice(1), 10),
            year: currentYear,
            semester: currentSemester,
          });
          break;
        }
      }

      const regex = new RegExp(`${escapeRegExp(pattern.source)}(\\d{3,4})\\/(\\d{2,3}(?:\\.\\d)?)([A-E]).*?([1-${maxGrade}])(\\d{2,3})$`);
      const match = compact.match(regex);
      if (!match) continue;

      const digitBlock = match[1];
      const trimmedBlock =
        digitBlock.length === 4 && currentSemester && digitBlock.startsWith(String(currentSemester))
          ? digitBlock.slice(1)
          : digitBlock;

      if (trimmedBlock.length !== 3) continue;

      extracted.push({
        subject: pattern.subject,
        unit: parseInt(trimmedBlock[0], 10),
        rawScore: parseInt(trimmedBlock.slice(1), 10),
        scoreAverage: parseFloat(match[2]),
        achievementLevel: match[3],
        grade: parseInt(match[4], 10),
        studentCount: parseInt(match[5], 10),
        year: currentYear,
        semester: currentSemester,
      });
      break;
    }
  }

  return uniqueSubjects(extracted);
}

function extractLineBasedSubjects(lines: string[], gradingSystem: "5-level" | "9-level") {
  const extracted: ExtractedSubject[] = [];
  const maxGrade = gradingSystem === "5-level" ? 5 : 9;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!/(원점수|과목평균|평균|성취도|등급|수강자)/.test(line)) continue;

    const matchedSubject = SUBJECT_KEYWORDS.find((subject) => line.includes(subject));
    if (!matchedSubject) continue;

    const unitMatch = line.match(/([1-9])\s*단위/);
    const gradeMatch = line.match(/([1-9])\s*등급/);
    if (!unitMatch || !gradeMatch) continue;

    const unit = parseInt(unitMatch[1], 10);
    const grade = parseInt(gradeMatch[1], 10);
    if (unit < 1 || unit > 6 || grade < 1 || grade > maxGrade) continue;

    extracted.push({
      subject: matchedSubject,
      unit,
      grade,
      year: line.match(/([1-3])\s*학년/) ? parseInt(line.match(/([1-3])\s*학년/)![1], 10) : undefined,
      semester: line.match(/([12])\s*학기/) ? parseInt(line.match(/([12])\s*학기/)![1], 10) : undefined,
      rawScore: line.match(/원점수\s*[:\-]?\s*(\d{1,3})/) ? parseInt(line.match(/원점수\s*[:\-]?\s*(\d{1,3})/)![1], 10) : undefined,
      scoreAverage: line.match(/(?:과목평균|평균)\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/)
        ? parseFloat(line.match(/(?:과목평균|평균)\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/)![1])
        : undefined,
      achievementLevel: line.match(/성취도\s*[:\-]?\s*([A-E])/i) ? line.match(/성취도\s*[:\-]?\s*([A-E])/i)![1].toUpperCase() : undefined,
      studentCount: line.match(/수강자수?\s*[:\-]?\s*(\d{1,3})/) ? parseInt(line.match(/수강자수?\s*[:\-]?\s*(\d{1,3})/)![1], 10) : undefined,
    });
  }

  return uniqueSubjects(extracted);
}

function detectMajorField(text: string) {
  if (/희망분야\s*생명과학|생명과학|의생명|DNA|전기영동|인지신경과학/i.test(text)) return "생명과학";
  if (/AI|인공지능|데이터/i.test(text)) return "AI·데이터";
  return "인문 / 사회 / 자연 / 공학 계열";
}

function extractKeywords(text: string) {
  return KEYWORD_CANDIDATES.filter((keyword) => text.includes(keyword)).slice(0, 6);
}

function buildStudentAnalysis(text: string, subjects: ExtractedSubject[]): StudentAnalysisPayload {
  const majorField = detectMajorField(text);
  const keyKeywords = extractKeywords(text);
  const weightedAverage =
    subjects.length > 0
      ? Number(
          (
            subjects.reduce((sum, item) => sum + item.unit * item.grade, 0) /
            subjects.reduce((sum, item) => sum + item.unit, 0)
          ).toFixed(2),
        )
      : null;

  const hasInquiry = /탐구|실험|분석|조사|발표/.test(text);
  const hasEthics = /윤리|책임|권리/.test(text);
  const hasClub = /동아리/.test(text);
  const hasCareer = /희망분야|진로/.test(text);

  return {
    majorSuitability:
      majorField === "생명과학"
        ? "생명과학 계열 전공 적합성이 높고 탐구 서사가 뚜렷합니다."
        : `${majorField} 계열 전공 적합성은 추가 확인이 필요합니다.`,
    majorField,
    keyKeywords,
    academicCapacity:
      weightedAverage !== null
        ? `교과 성적은 가중 평균 ${weightedAverage.toFixed(2)}등급으로 확인되며 기본 학업 안정성이 있습니다.`
        : "교과 성적 추출은 제한적이지만 학생부 서사만으로도 기본 학업 역량은 확인됩니다.",
    activityAutonomous: hasInquiry
      ? "자료 조사, 비교 분석, 실험 설계와 발표까지 이어지는 자기주도 흔적이 확인됩니다."
      : "자기주도 탐구 근거는 추가 확인이 필요합니다.",
    activityClub: hasClub
      ? "동아리 활동에서도 전공 관심이 이어져 교과와 비교과 연결성이 드러납니다."
      : "동아리 활동의 전공 연계성은 원문 추가 확인이 필요합니다.",
    activityCareer: hasCareer
      ? `진로 기록이 ${majorField} 축과 연결되어 방향성이 비교적 분명합니다.`
      : "진로 기록은 추가 정리가 필요합니다.",
    seTeukAnalysis:
      keyKeywords.length > 0
        ? `${keyKeywords.slice(0, 4).join(", ")} 중심의 탐구가 반복되며${hasEthics ? " 윤리와 책임 문제까지 함께 다룹니다." : " 전공 관심의 일관성이 보입니다."}`
        : "학생부 핵심 문장을 기반으로 세특 해석이 필요합니다.",
    comprehensiveOpinion:
      majorField === "생명과학"
        ? `생명과학 중심의 학생부이며 ${hasInquiry ? "탐구, 분석, 발표" : "전공 관심"} 흐름이 일관됩니다. 학생부종합전형에서 설득력이 높습니다.`
        : "전공 관심 축은 보이지만 종합 판단에는 추가 자료가 필요합니다.",
  };
}

export function calculateGPAFromText(text: string, gradingSystem: "5-level" | "9-level"): PDFAnalysisResult {
  const lines = text.split(/[\r\n]+/);
  const transcriptSubjects = extractTranscriptRows(lines, gradingSystem);
  const lineSubjects = transcriptSubjects.length === 0 ? extractLineBasedSubjects(lines, gradingSystem) : [];
  const subjects = uniqueSubjects([...transcriptSubjects, ...lineSubjects]);
  const studentAnalysis = buildStudentAnalysis(text, subjects);

  if (subjects.length === 0) {
    return {
      gpa: 0,
      subjects: [],
      message: "성적표 영역에서 유효한 교과 성적(단위수 및 석차등급) 정보를 찾지 못했습니다.",
      success: false,
      studentAnalysis,
    };
  }

  const totalWeight = subjects.reduce((sum, item) => sum + item.unit, 0);
  const weightedSum = subjects.reduce((sum, item) => sum + item.unit * item.grade, 0);
  const gpa = Number((weightedSum / totalWeight).toFixed(2));

  return {
    gpa,
    subjects,
    studentAnalysis,
    message: `성공적으로 학생부 PDF 성적(${subjects.length}개 과목)을 자동 분석했습니다.`,
    success: true,
  };
}
