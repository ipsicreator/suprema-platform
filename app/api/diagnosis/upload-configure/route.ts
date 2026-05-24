import { NextResponse } from "next/server";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";

export const runtime = "nodejs";

const COLLECTION = "suprema_pdf_uploads";

export async function POST() {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ ok: false, error: "pocketbase_admin_not_configured" }, { status: 500 });
  }

  const pb = await pbAdmin();

  const col = await pb.collections.getOne(COLLECTION);

  // Ensure direct browser upload works (bypass Vercel request size limits).
  // Disallow list/view/update/delete to keep it private.
  const desired = {
    ...col,
    listRule: "false",
    viewRule: "false",
    createRule: "true",
    updateRule: "false",
    deleteRule: "false",
  };

  await pb.collections.update(COLLECTION, desired as any);

  return NextResponse.json({
    ok: true,
    collection: COLLECTION,
    rules: {
      listRule: desired.listRule,
      viewRule: desired.viewRule,
      createRule: desired.createRule,
      updateRule: desired.updateRule,
      deleteRule: desired.deleteRule,
    },
  });
}

