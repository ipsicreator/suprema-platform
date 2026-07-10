import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: false, error: "분리된 프로젝트 API입니다." }, { status: 404 });
}
