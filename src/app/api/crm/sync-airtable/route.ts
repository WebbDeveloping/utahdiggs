import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/admin-auth";
import { canManageUsers } from "@/lib/auth/roles";
import { syncAirtableData } from "@/lib/airtable-sync/sync";
import { getSessionUser } from "@/lib/crm/access";
import { prisma } from "@/lib/db";

export const maxDuration = 300;

export async function POST(): Promise<NextResponse> {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user || !canManageUsers(user.role)) {
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
