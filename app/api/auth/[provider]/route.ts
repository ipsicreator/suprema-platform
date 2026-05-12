import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PROVIDER = new Set(["google", "naver", "kakao"]);

export function GET(_req: NextRequest, context: { params: Promise<{ provider: string }> }) {
  return context.params.then(({ provider }) => {
    if (!ALLOWED_PROVIDER.has(provider)) {
      return NextResponse.redirect(new URL("/", "http://localhost:3000"));
    }

    // Compatibility route: keep legacy links working through NextAuth.
    return NextResponse.redirect(new URL(`/api/auth/signin/${provider}`, "http://localhost:3000"));
  });
}
