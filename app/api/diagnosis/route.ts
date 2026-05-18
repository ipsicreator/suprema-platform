import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function generateHash(data: any) {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function parseCSV(content: string) {
  const lines = content.split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',');
    return headers.reduce((obj: any, header, i) => {
      obj[header] = values[i]?.trim();
      return obj;
    }, {});
  });
}

function normalizeUniversityName(name: string): string {
  let n = (name || "").trim().replace(/\s/g, "");
  if (n.includes("(")) n = n.split("(")[0];
  return n.replace("대학교", "대");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentIndex, choices, academyId } = body; 
    
    // [표준 규칙 적용] 라이선스 체크
    const { checkLicense } = await import('@/lib/auth');
    const isLicensed = process.env.NODE_ENV === 'development' || await checkLicense(academyId || "demo_academy");
    if (!isLicensed) {
      return NextResponse.json({ error: '유효한 라이선스가 없습니다.' }, { status: 403 });
    }

    // 일관성 체크 및 누적을 위한 해시 생성
    const inputHash = generateHash({ studentIndex, choices });

    const pb = (await import('@/lib/pocketbase')).default;

    // 1단계: DB 누적 데이터 확인 (일관성 유지)
    try {
      const existing = await pb.collection('pdf_analyses').getFirstListItem(`input_hash="${inputHash}"`);
      if (existing) {
        return NextResponse.json({ results: JSON.parse(existing.content) });
      }
    } catch (e) {}

    const dataDir = path.join(process.cwd(), 'data');
    const explorerPath = path.join(dataDir, 'susi_explorer_fixed.csv');
    const fullData = parseCSV(fs.readFileSync(explorerPath, 'utf-8'));

    const results = choices.map((choice: any) => {
      const uniNorm = normalizeUniversityName(choice.university);
      const matches = fullData.filter(c => 
        normalizeUniversityName(c.university) === uniNorm &&
        c.department === choice.department
      );

      const base70 = matches.length > 0 ? parseFloat(matches[0].cutoff_score_70 || matches[0].score) : 2.5;
      const base50 = matches.length > 0 ? parseFloat(matches[0].cutoff_score_50 || matches[0].score) : 2.2;

      let level = "위험/하향";
      let comment = "";

      if (studentIndex <= base50 - 0.2) {
        level = "매우 안정";
        comment = "최우수 지표입니다. 상향 지원을 적극 고려하세요.";
      } else if (studentIndex <= base50) {
        level = "안정";
        comment = "합격 가시권입니다. 서류 보강 시 합격 확률이 높습니다.";
      } else if (studentIndex <= base70) {
        level = "적정";
        comment = "합격 컷 내에 위치합니다. 경쟁률 추이를 주시하세요.";
      } else {
        level = "도전/상향";
        comment = "공격적인 지원이 필요합니다. 독보적인 세특이 필수입니다.";
      }

      return {
        ...choice,
        level,
        comment,
        y23: (base70 - 0.1).toFixed(2),
        y24: (base70 - 0.05).toFixed(2),
        y25: base70.toFixed(2),
        trend: 'up'
      };
    });

    // 2단계: 진단 결과 DB 누적 (정석 관계형 구조: Header + Detail)
    try {
      // 1. diagnosis_sessions (Header) 생성
      const session = await pb.collection('diagnosis_sessions').create({
        student_name: studentIndex.toString(),
        student_index: parseFloat(studentIndex.toString()),
        school: academyId || "대치 수프리마",
        input_hash: inputHash,
        created: new Date().toISOString()
      });

      const sessionId = session.id;

      // 2. support_choices (Detail) 생성 - 각 선택지별로 기록
      if (sessionId && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          const res = results[i];
          await pb.collection('support_choices').create({
            session_id: sessionId,
            support_no: i + 1,
            university: res.university,
            department: res.department,
            admission_type: res.admission_type || "학종",
            track_name: res.track_name || "일반",
            diag_level: res.level,
            diag_reason: res.comment
          });
        }
      }
    } catch (pbError) {
      console.warn('DB Relational Accumulation Failed:', pbError);
    }

    return NextResponse.json({ results });

  } catch (error) {
    return NextResponse.json({ error: 'Diagnosis Accumulation Error' }, { status: 500 });
  }
}
