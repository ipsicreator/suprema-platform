import { NextResponse } from "next/server";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";

export const runtime = "nodejs";

const COLLECTION = "suprema_pdf_uploads";

type PocketBaseCollectionRecord = {
  id?: string;
  name?: string;
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  [key: string]: unknown;
};

type PocketBaseCollectionsApi = {
  getFullList: () => Promise<PocketBaseCollectionRecord[]>;
  getOne: (id: string) => Promise<PocketBaseCollectionRecord>;
  create: (payload: Record<string, unknown>) => Promise<PocketBaseCollectionRecord>;
  update: (id: string, payload: Record<string, unknown>) => Promise<unknown>;
};

type PocketBaseAdminClient = {
  collections: PocketBaseCollectionsApi;
};

async function findCollectionIdByName(pb: PocketBaseAdminClient, name: string): Promise<string | null> {
  try {
    const list = await pb.collections.getFullList();
    const found = (list || []).find((collection) => collection?.name === name);
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

    const pb = (await pbAdmin()) as unknown as PocketBaseAdminClient;

    let col: PocketBaseCollectionRecord;
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
    await pb.collections.update(updateId, desired);

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "pocketbase_admin_configure_failed", message },
      { status: 500 },
    );
  }
}
