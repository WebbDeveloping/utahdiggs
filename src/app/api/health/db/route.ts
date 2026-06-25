import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL is not configured",
      },
      { status: 503 },
    );
  }

  try {
    const [userCount, contactCount, listingCount, closingTeamCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.contact.count(),
        prisma.listing.count(),
        prisma.closingTeamMember.count(),
      ]);

    return NextResponse.json({
      ok: true,
      database: "connected",
      counts: {
        users: userCount,
        contacts: contactCount,
        listings: listingCount,
        closingTeam: closingTeamCount,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 503 },
    );
  }
}
