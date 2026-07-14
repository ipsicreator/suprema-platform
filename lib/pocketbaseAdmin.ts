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
    
    try {
      // PocketBase v0.23.0+ uses _superusers collection
      await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    } catch (e: any) {
      // Fallback for older servers (< v0.23) using a raw fetch, because JS SDK v0.23+ removed pb.admins entirely
      const res = await fetch(`${PB_URL.endsWith('/') ? PB_URL.slice(0, -1) : PB_URL}/api/admins/auth-with-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
        cache: "no-store",
      });
      
      if (!res.ok) {
        throw new Error(`Admin auth failed on both _superusers and legacy admins endpoint. Legacy status: ${res.status}`);
      }
      
      const data = await res.json();
      pb.authStore.save(data.token, data.admin);
    }
    
    cached.authed = true;
  }
  return pb;
}

