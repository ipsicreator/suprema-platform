import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COLLECTION = "suprema_pdf_uploads";

export async function GET() {
  const pbUrl = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || "";
  if (!pbUrl) {
    return NextResponse.json({ ok: false, error: "PDF 업로드 저장소 설정이 완료되지 않았습니다." }, { status: 500 });
  }

  const normalizedPbUrl = pbUrl.endsWith("/") ? pbUrl.slice(0, -1) : pbUrl;

  return NextResponse.json({
    ok: true,
    pbUrl,
    collection: COLLECTION,
    uploadUrl: `${normalizedPbUrl}/api/collections/${COLLECTION}/records`,
  });
}
