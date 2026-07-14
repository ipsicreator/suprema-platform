import zlib from "zlib";


export interface ExtractedSubject {
  subject: string;
  unit: number;
  grade: number;
  year?: number;
  semester?: number;
}

export interface PDFAnalysisResult {
  gpa: number;
  subjects: ExtractedSubject[];
  message: string;
  success: boolean;
  studentAnalysis?: Record<string, unknown>;
}

// Extract pure text from raw PDF buffer using built-in zlib FlateDecode streams
export function extractTextFromPDFBuffer(buffer: Buffer): string {
  let text = "";
  let pos = 0;
  
  while (pos < buffer.length) {
    const streamIdx = buffer.indexOf("stream", pos);
    if (streamIdx === -1) break;
    
    // Find matching endstream
    const endstreamIdx = buffer.indexOf("endstream", streamIdx);
    if (endstreamIdx === -1) break;
    
    // Extract binary stream chunk
    let streamData = buffer.subarray(streamIdx + 6, endstreamIdx);
    
    // Clean leading/trailing whitespaces/newlines (CRLF/LF)
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
      // Decompress FlateDecode stream natively via Node's zlib
      const decompressed = zlib.inflateSync(streamData);
      const decompressedText = decompressed.toString("binary");
      
      // Parse standard PDF Tj/TJ text operators
      // 1. Tj Paren String Format: (Text) Tj
      const parenRegex = /\(([^)]*)\)\s*Tj/g;
      let match;
      while ((match = parenRegex.exec(decompressedText)) !== null) {
        text += match[1] + " ";
      }
      
      // 2. TJ Array Format: [(Text1) 120 (Text2)] TJ
      const tjRegex = /\[(.*?)\]\s*TJ/g;
      while ((match = tjRegex.exec(decompressedText)) !== null) {
        const content = match[1];
        const innerParenRegex = /\(([^)]*)\)/g;
        let innerMatch;
        while ((innerMatch = innerParenRegex.exec(content)) !== null) {
          text += innerMatch[1] + " ";
        }
      }
      
      // 3. Hex UTF-16BE format (very common in Korean PDF transcripts): <AC00> Tj
      const hexRegex = /<([0-9a-fA-F]+)>\s*Tj/g;
      while ((match = hexRegex.exec(decompressedText)) !== null) {
        const hex = match[1];
        try {
          const buf = Buffer.from(hex, "hex");
          // Swap bytes for little endian conversion (UTF-16BE -> UTF-16LE)
          for (let i = 0; i < buf.length; i += 2) {
            const temp = buf[i];
            buf[i] = buf[i + 1];
            buf[i + 1] = temp;
          }
          text += buf.toString("utf16le") + " ";
        } catch {}
      }
    } catch {
      // Pass other uncompressed / binary streams
    }
    
    pos = endstreamIdx + 9;
  }
  
  return text;
}

// Match subjects, units, and rank grades to compute GPA
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
  "기하"
];

export function calculateGPAFromText(text: string, gradingSystem: "5-level" | "9-level"): PDFAnalysisResult {
  const normalized = text.replace(/\s+/g, " ");
  const defaultAnalysis = {
    majorSuitability: "기본 분석",
    majorField: "인문 / 사회 / 자연 / 공학 계열",
    keyKeywords: ["탐구역량", "교과역량", "자기주도성"],
    academicCapacity: "학생부 항목을 바탕으로 기본 분석을 수행합니다.",
    activityAutonomous: "탐구 활동과 자율적 학습 흔적을 함께 확인합니다.",
    activityClub: "동아리 활동은 탐구 주제와 연결해 해석합니다.",
    activityCareer: "진로 관련 기록은 주제 탐구 흐름에 반영합니다.",
    seTeukAnalysis: "학생부 핵심 문장을 기반으로 진단합니다.",
    comprehensiveOpinion: "기본 학생부 분석 결과입니다."
  };

  const lines = text.split(/[\r\n]+/);
  const extracted: ExtractedSubject[] = [];
  
  // Strategy A: Scan line-by-line for Korean transcript structure
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    const matchedSubject = SUBJECT_KEYWORDS.find(sub => line.includes(sub));
    if (matchedSubject) {
      const yearMatch = line.match(/([1-3])\s*?숇뀈/);
      const semesterMatch = line.match(/([12])\s*?숆린/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
      const semester = semesterMatch ? parseInt(semesterMatch[1], 10) : undefined;

      // Find numbers representing [units, grade] in standard transcript row
      const numbers = line.match(/\b([1-9])\b/g);
      if (numbers && numbers.length >= 2) {
        const unit = parseInt(numbers[0], 10);
        const grade = parseInt(numbers[1], 10);
        
        const maxGrade = gradingSystem === "5-level" ? 5 : 9;
        if (unit >= 1 && unit <= 6 && grade >= 1 && grade <= maxGrade) {
          extracted.push({
            subject: matchedSubject,
            unit,
            grade,
            year,
            semester
          });
        }
      }
    }
  }
  
  // Strategy B: Sliding window regex in case of flat single line flow
  if (extracted.length === 0) {
    for (const sub of SUBJECT_KEYWORDS) {
      // Matches pattern: "Subject (Any spacing) Units (Any spacing) Grade"
      const regex = new RegExp(`${sub}[媛-?쥱-Za-z0-9\\s]{0,8}?\\s*\\(?([1-6])\\)?\\s*(?:?⑥쐞)?\\s*(?:[A-E]\\(?\\d*\\)?|?깆랬???\\s*\\(?([1-9])\\)?\\s*(?:?깃툒)?`, "g");
      let match;
      while ((match = regex.exec(normalized)) !== null) {
        const unit = parseInt(match[1], 10);
        const grade = parseInt(match[2], 10);
        const maxGrade = gradingSystem === "5-level" ? 5 : 9;
        if (grade <= maxGrade) {
          extracted.push({
            subject: sub,
            unit,
            grade
          });
        }
      }
    }
  }
  
  // Deduplicate and filter exact copies
  const uniqueExtracted: ExtractedSubject[] = [];
  const seen = new Set<string>();
  for (const item of extracted) {
    const key = `${item.subject}-${item.unit}-${item.grade}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueExtracted.push(item);
    }
  }
  
  if (uniqueExtracted.length === 0) {
    return {
      gpa: 0,
      subjects: [],
      message: "?깆쟻???곸뿭?먯꽌 ?좏슚??援먭낵 ?깆쟻(?⑥쐞??諛??앹감?깃툒) ?뺣낫瑜??앸퀎?섏? 紐삵뻽?듬땲??",
      success: false
    };
  }
  
  // Calculate weighted GPA average
  let totalWeight = 0;
  let weightedSum = 0;
  for (const item of uniqueExtracted) {
    weightedSum += item.unit * item.grade;
    totalWeight += item.unit;
  }
  
  const gpa = Number((weightedSum / totalWeight).toFixed(2));
  
  return {
    gpa,
    subjects: uniqueExtracted,
    studentAnalysis: defaultAnalysis,
    message: `?깃났?곸쑝濡??숈깮遺 PDF ?깆쟻(${uniqueExtracted.length}媛?怨쇰ぉ)???먮룞 遺꾩꽍?덉뒿?덈떎.`,
    success: true
  };
}

