import { NextRequest, NextResponse } from "next/server";
import { handlers } from "../../../../auth"; // Import the NextAuth handlers directly

const ALLOWED_PROVIDER = new Set(["google", "naver", "kakao"]);

export function GET(req: NextRequest, context: { params: Promise<{ provider: string }> }) {
  return context.params.then(({ provider }) => {
    if (!ALLOWED_PROVIDER.has(provider)) {
      // Delegate to NextAuth catch-all handler for /api/auth/session, /api/auth/csrf, etc.
      return handlers.GET(req);
    }

    // Compatibility route: keep legacy links working through NextAuth.
    return NextResponse.redirect(new URL(`/api/auth/signin/${provider}`, req.nextUrl.origin));
  });
}
