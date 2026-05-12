import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET(req: NextRequest) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const explorerPath = path.join(dataDir, 'susi_explorer.csv');
    
    if (!fs.existsSync(explorerPath)) {
      return NextResponse.json({ universities: [] });
    }

    const content = fs.readFileSync(explorerPath, 'utf-8');
    const data = parseCSV(content);

    // 고유한 대학 및 학과 목록 추출
    const uniMap = new Map();
    data.forEach((item: any) => {
      if (!uniMap.has(item.university)) {
        uniMap.set(item.university, new Set());
      }
      uniMap.get(item.university).add(item.department);
    });

    const result = Array.from(uniMap.entries()).map(([name, depts]) => ({
      name,
      departments: Array.from(depts)
    }));

    return NextResponse.json({ universities: result });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}
