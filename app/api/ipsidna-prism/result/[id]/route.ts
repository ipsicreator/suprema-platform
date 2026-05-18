import { NextResponse } from "next/server";
import { pbAdmin, hasPocketBaseAdmin } from "@/lib/pocketbaseAdmin";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ ok: false, error: "pocketbase_not_configured" }, { status: 500 });
  }
  const { id } = await ctx.params;
  const rid = String(id || "").trim();
  if (!rid) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

  const pb = await pbAdmin();
  const rec = await pb.collection("prism_assessments").getOne(rid).catch(() => null);
  if (!rec) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    id: rec.id,
    lead_id: rec.lead_id,
    kind: rec.kind,
    answers: rec.answers,
    score: rec.score,
    engine_type: rec.engine_type,
    created: rec.created,
  });
}

