import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type ProfileRecord = Record<string, unknown>;
type ProfilesStore = Record<string, ProfileRecord>;

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILES_FILE = path.join(DATA_DIR, "profiles.json");

function getProfiles(): ProfilesStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROFILES_FILE)) return {};

  try {
    return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf-8")) as ProfilesStore;
  } catch {
    return {};
  }
}

function saveProfiles(data: ProfilesStore) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    const profiles = getProfiles();
    const profile = profiles[phone];

    if (profile) {
      return NextResponse.json({ profile });
    }

    return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProfileRecord & { phone?: string };
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required as unique ID" }, { status: 400 });
    }

    const profiles = getProfiles();
    profiles[phone] = {
      ...profiles[phone],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    saveProfiles(profiles);

    return NextResponse.json({ success: true, profile: profiles[phone] });
  } catch (error) {
    console.error("Profile Save Error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
