import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { syncAirtableData } from "@/lib/airtable-sync/sync";

export const maxDuration = 300;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncAirtableData(prisma);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    console.error("Airtable sync failed:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
