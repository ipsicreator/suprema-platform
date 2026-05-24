import { NextResponse } from "next/server";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";

export const runtime = "nodejs";

const COLLECTION = "suprema_pdf_uploads";

async function ensureUploadCollection() {
  if (!hasPocketBaseAdmin()) return;
  const pb = await pbAdmin();

  try {
    await pb.collections.getOne(COLLECTION);
    return;
  } catch {}

  await pb.collections.create({
    name: COLLECTION,
    type: "base",
    // Allow unauthenticated create (direct browser upload),
    // but disallow list/view/update/delete without admin.
    listRule: "false",
    viewRule: "false",
    createRule: "true",
    updateRule: "false",
    deleteRule: "false",
    fields: [
      {
        name: "file",
        type: "file",
        required: true,
        options: {
          maxSelect: 1,
          maxSize: 50 * 1024 * 1024,
          mimeTypes: ["application/pdf"],
        },
      },
      { name: "student_name", type: "text", required: false },
      { name: "school_name", type: "text", required: false },
    ],
  });
}

export async function GET() {
  const pbUrl = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || "";
  if (!pbUrl) {
    return NextResponse.json({ ok: false, error: "pocketbase_not_configured" }, { status: 500 });
  }

  await ensureUploadCollection();

  const normalizedPbUrl = pbUrl.endsWith("/") ? pbUrl.slice(0, -1) : pbUrl;

  return NextResponse.json({
    ok: true,
    pbUrl,
    collection: COLLECTION,
    uploadUrl: `${normalizedPbUrl}/api/collections/${COLLECTION}/records`,
  });
}
