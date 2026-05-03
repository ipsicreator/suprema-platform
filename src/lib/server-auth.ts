import { auth } from "../../auth";
import { upsertUserBySession } from "@/lib/platform-store";

export async function getCurrentUserOrThrow() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const sessionUserId = `${user.email ?? "no-email"}:${(user as { provider?: string }).provider ?? "unknown"}`;
  const provider = (user as { provider?: string }).provider;
  const providerId = (user as { providerId?: string }).providerId;

  await upsertUserBySession({
    sessionUserId,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    provider,
    providerId,
  });

  return {
    userId: sessionUserId,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
  };
}

export async function requireAdminOrThrow() {
  const currentUser = await getCurrentUserOrThrow();
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) {
    throw new Error("ADMIN_NOT_CONFIGURED");
  }
  if (!currentUser.email || !allowlist.includes(currentUser.email.toLowerCase())) {
    throw new Error("FORBIDDEN");
  }
  return currentUser;
}
