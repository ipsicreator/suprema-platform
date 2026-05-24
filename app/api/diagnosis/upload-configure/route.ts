import { NextResponse } from "next/server";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";

export const runtime = "nodejs";

const COLLECTION = "suprema_pdf_uploads";

async function findCollectionIdByName(pb: any, name: string): Promise<string | null> {
  try {
    const list = await pb.collections.getFullList();
    const found = (list || []).find((c: any) => c?.name === name);
    return found?.id || null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    if (!hasPocketBaseAdmin()) {
      return NextResponse.json(
        { ok: false, error: "pocketbase_admin_not_configured" },
        { status: 500 },
      );
    }

    const pb = await pbAdmin();

    let col: any;
    const collectionId = (await findCollectionIdByName(pb, COLLECTION)) || COLLECTION;
    try {
      col = await pb.collections.getOne(collectionId);
    } catch {
      // Collection missing in this PocketBase instance: create it.
      col = await pb.collections.create({
        name: COLLECTION,
        type: "base",
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

    const updateId = desired?.id || (await findCollectionIdByName(pb, COLLECTION)) || COLLECTION;
    await pb.collections.update(updateId, desired as any);

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
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "pocketbase_admin_configure_failed", message: e?.message || String(e) },
      { status: 500 },
    );
  }
}
