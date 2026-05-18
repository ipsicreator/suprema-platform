import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || "";
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "";
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "";

let cached: { pb: PocketBase; authed: boolean } | null = null;

export function hasPocketBaseAdmin(): boolean {
  return Boolean(PB_URL && PB_ADMIN_EMAIL && PB_ADMIN_PASSWORD);
}

export async function pbAdmin(): Promise<PocketBase> {
  if (!PB_URL) throw new Error("PB_URL is missing");
  const pb = cached?.pb ?? new PocketBase(PB_URL);
  if (!cached) cached = { pb, authed: false };

  if (!cached.authed) {
    if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
      throw new Error("PB admin credentials are missing (PB_ADMIN_EMAIL/PB_ADMIN_PASSWORD)");
    }
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    cached.authed = true;
  }
  return pb;
}

