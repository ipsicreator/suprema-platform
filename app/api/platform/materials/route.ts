import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type SourceMaterial = {
  title: string;
  path: string;
  subjects: string[];
};

let cache: SourceMaterial[] | null = null;

function loadMaterials(): SourceMaterial[] {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "data", "source_materials.json");
  const raw = fs.readFileSync(filePath, "utf8");
  cache = JSON.parse(raw) as SourceMaterial[];
  return cache;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject") || "";

  try {
    const materials = loadMaterials();
    const filtered = subject
      ? materials.filter((item) => Array.isArray(item.subjects) && item.subjects.some((value) => value.includes(subject)))
      : materials;

    return NextResponse.json({
      subject,
      materials: filtered.slice(0, 8),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { subject, materials: [], error: error instanceof Error ? error.message : "source_materials_load_failed" },
      { status: 500 }
    );
  }
}


