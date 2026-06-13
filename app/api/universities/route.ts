import { NextResponse } from 'next/server';
import universities from '@/data/universities.json';

export async function GET() {
  return NextResponse.json({ universities });
}
