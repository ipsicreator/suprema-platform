import { NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';

interface HistoryRecord {
  [key: string]: unknown;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    let history: HistoryRecord[] = [];
    if (type === 'setuk') {
      // setuk_history 컬렉션에서 데이터 가져오기
      history = await pb.collection('setuk_history').getFullList({
        sort: '-created',
      });
    } else if (type === 'diagnosis') {
      // diagnosis_sessions 컬렉션에서 데이터 가져오기
      history = await pb.collection('diagnosis_sessions').getFullList({
        sort: '-created',
        expand: 'support_choices_via_session_id',
      });
    }

    return NextResponse.json({ success: true, history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error('History fetch error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
