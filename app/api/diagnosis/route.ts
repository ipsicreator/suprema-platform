import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { diagnoseAdmissionRange, type YearCutoff } from '@/lib/utils/admission/admissionDiagnosis';

export const runtime = "nodejs";

type AdmissionDataRow = {
  univ: string;
  dept?: string;
  type?: string;
  name?: string;
  cutoff24?: number | string | null;
  cutoff25?: number | string | null;
  cutoff26_50?: number | string | null;
  cutoff26_70?: number | string | null;
};

type DiagnosisChoice = {
  university?: string;
  univ?: string;
  department?: string;
  dept?: string;
  admission_type?: string;
  type?: string;
  track_name?: string;
  track?: string;
  [key: string]: unknown;
};

type DiagnosisRequestBody = {
  studentIndex?: string | number;
  choices?: DiagnosisChoice[];
  academyId?: string;
  grade?: string;
  gradingSystem?: string;
};

let cachedAdmissionData: AdmissionDataRow[] | null = null;

function generateHash(data: unknown) {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function normalizeUniversityName(name: string): string {
  let value = (name || "").trim().replace(/\s/g, "");
  if (value.includes("(")) value = value.split("(")[0];
  return value;
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = String(value).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return parsed ? Number(parsed[0]) : null;
}

function convert5To9Grade(g5: number): number {
  if (g5 <= 1.0) return 1.0;
  if (g5 <= 2.0) return 1.0 + (g5 - 1.0) * 2.6;
  if (g5 <= 3.0) return 3.6 + (g5 - 2.0) * 2.2;
  if (g5 <= 4.0) return 5.8 + (g5 - 3.0) * 2.0;
  if (g5 <= 5.0) return 7.8 + (g5 - 4.0) * 1.2;
  return 9.0;
}

function loadAdmissionData(): AdmissionDataRow[] {
  if (cachedAdmissionData) return cachedAdmissionData;
  const dataDir = path.join(process.cwd(), 'data');
  const admissionPath = path.join(dataDir, 'admission', 'admissionData.json');
  if (!fs.existsSync(admissionPath)) {
    cachedAdmissionData = [];
    return cachedAdmissionData;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(admissionPath, 'utf-8')) as AdmissionDataRow[];
    cachedAdmissionData = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedAdmissionData = [];
  }
  return cachedAdmissionData ?? [];
}

function resolveRow(choice: DiagnosisChoice, fullData: AdmissionDataRow[]) {
  const university = String(choice.university ?? choice.univ ?? '').trim();
  const department = String(choice.department ?? choice.dept ?? '').trim();
  const admissionType = String(choice.admission_type ?? choice.type ?? '').trim();
  const trackName = String(choice.track_name ?? choice.track ?? '').trim();
  const uniNorm = normalizeUniversityName(university);

  const exact = fullData.find((row) =>
    normalizeUniversityName(row.univ) === uniNorm &&
    String(row.dept ?? '').trim() === department &&
    String(row.type ?? '').trim() === admissionType &&
    String(row.name ?? '').trim() === trackName,
  );
  if (exact) return exact;

  const typeMatch = fullData.find((row) =>
    normalizeUniversityName(row.univ) === uniNorm &&
    String(row.dept ?? '').trim() === department &&
    String(row.type ?? '').trim() === admissionType,
  );
  if (typeMatch) return typeMatch;

  return fullData.find((row) =>
    normalizeUniversityName(row.univ) === uniNorm &&
    String(row.dept ?? '').trim() === department,
  ) ?? null;
}

function formatCutoff(value: number | null) {
  return value === null ? null : Number(value.toFixed(2));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DiagnosisRequestBody;
    const { studentIndex, choices, academyId, grade, gradingSystem } = body;

    if (studentIndex === undefined || studentIndex === null || !choices?.length) {
      return NextResponse.json({ error: 'Invalid diagnosis request' }, { status: 400 });
    }

    let evalIndex = parseFloat(studentIndex.toString());
    const is5Level = gradingSystem === '5-level' || grade === '5' || grade === 'five' || grade === '5-level';
    if (is5Level) {
      evalIndex = convert5To9Grade(evalIndex);
    }

    const { checkLicense } = await import('@/lib/auth');
    const isLicensed = process.env.NODE_ENV === 'development' || await checkLicense(academyId || "demo_academy");
    if (!isLicensed) {
      return NextResponse.json({ error: '유효한 라이선스가 없습니다.' }, { status: 403 });
    }

    generateHash({ studentIndex: evalIndex, choices });

    const fullData = loadAdmissionData();

    const results = choices.map((choice) => {
      const row = resolveRow(choice, fullData);
      const diagnosis = row
        ? diagnoseAdmissionRange(evalIndex, [
            {
              year: 2026,
              cutoff50: parseNumber(row.cutoff26_50),
              cutoff70: parseNumber(row.cutoff26_70),
            },
            {
              year: 2025,
              cutoff50: parseNumber(row.cutoff25),
              cutoff70: parseNumber(row.cutoff25),
            },
            {
              year: 2024,
              cutoff50: parseNumber(row.cutoff24),
              cutoff70: parseNumber(row.cutoff24),
            },
          ] as YearCutoff[])
        : diagnoseAdmissionRange(evalIndex, []);

      const yearMap = new Map(diagnosis.yearly.map((item) => [item.year, item]));
      const year2026 = yearMap.get(2026);
      const year2025 = yearMap.get(2025);
      const year2024 = yearMap.get(2024);

      return {
        ...choice,
        level: diagnosis.finalLevel,
        comment: diagnosis.finalComment,
        safeCutoff: formatCutoff(diagnosis.safeCutoff),
        reachCutoff: formatCutoff(diagnosis.reachCutoff),
        spread: formatCutoff(diagnosis.spread),
        y26: year2026?.cutoff70 !== null && year2026?.cutoff70 !== undefined ? year2026.cutoff70.toFixed(2) : '-',
        y25: year2025?.cutoff70 !== null && year2025?.cutoff70 !== undefined ? year2025.cutoff70.toFixed(2) : '-',
        y24: year2024?.cutoff70 !== null && year2024?.cutoff70 !== undefined ? year2024.cutoff70.toFixed(2) : '-',
        yearly: diagnosis.yearly,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Diagnosis Accumulation Error' }, { status: 500 });
  }
}
