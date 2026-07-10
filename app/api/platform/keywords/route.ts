import { NextResponse } from "next/server";
import pb from "@/lib/pocketbase";

type AnalysisSummaryContent = {
  keywords?: string[];
  analysis?: {
    core_competencies?: string[];
  };
  summary?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const student = await pb
      .collection("suprema_students")
      .getFirstListItem(`user_id = "${userId}"`)
      .catch(() => null);

    if (!student) {
      return NextResponse.json({ keywords: [] });
    }

    const latestAnalysis = await pb
      .collection("suprema_pdf_analyses")
      .getFirstListItem(`student_id = "${student.id}"`, {
        sort: "-created",
      })
      .catch(() => null);

    if (!latestAnalysis || !latestAnalysis.content) {
      return NextResponse.json({ keywords: [] });
    }

    let keywords: string[] = [];
    const content = latestAnalysis.content as AnalysisSummaryContent;

    if (Array.isArray(content.keywords)) {
      keywords = content.keywords;
    } else if (Array.isArray(content.analysis?.core_competencies)) {
      keywords = content.analysis.core_competencies;
    } else if (typeof content.summary === "string") {
      keywords = content.summary.split(/[\s,]+/).filter((token) => token.length > 1).slice(0, 5);
    }

    return NextResponse.json({ keywords: keywords.slice(0, 2) });
  } catch (error) {
    console.error("Failed to fetch keywords:", error);
    return NextResponse.json({ keywords: [] });
  }
}
