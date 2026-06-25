import { NextRequest, NextResponse } from "next/server";
import {
  loginPortalUser,
  PORTAL_SESSION_COOKIE,
} from "@/lib/auth/portal-auth";

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured" },
      { status: 503 },
    );
  }

  let body: { slug?: string; email?: string; passcode?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = await loginPortalUser({
    slug: body.slug ?? "",
    email: body.email ?? "",
    passcode: body.passcode ?? "",
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    listingId: result.listingId,
    contactId: result.contactId,
  });

  response.cookies.set(PORTAL_SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: result.expiresAt,
  });

  return response;
}
