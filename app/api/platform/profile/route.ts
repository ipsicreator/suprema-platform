import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/platform-store";
import { getCurrentUserOrThrow } from "@/lib/server-auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUserOrThrow();
    const profile = await getUserProfile(currentUser.userId);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "프로필 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserOrThrow();
    const body = (await req.json()) as UserProfile;
    const requiredOk = Boolean(body.studentName && body.schoolName && body.grade);
    if (!requiredOk) {
      return NextResponse.json(
        { success: false, error: "studentName, schoolName, grade는 필수입니다." },
        { status: 400 },
      );
    }
    const saved = await saveUserProfile(currentUser.userId, body);
    return NextResponse.json({ success: true, profile: saved });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "로그인이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "프로필 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
