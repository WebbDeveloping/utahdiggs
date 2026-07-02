import { NextResponse } from "next/server";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";
import {
  parseDocumentDisposition,
  resolveListingDocumentResponse,
} from "@/lib/storage/serve-listing-document";

type RouteContext = {
  params: Promise<{ id: string; documentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getConsumerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId, documentId } = await context.params;

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId: session.id },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const document = await prisma.document.findFirst({
    where: { id: documentId, listingId },
    select: { id: true, name: true, url: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const mode = parseDocumentDisposition(searchParams.get("disposition"));

  try {
    const { body, contentType, contentDisposition } = await resolveListingDocumentResponse({
      url: document.url,
      name: document.name,
      mode,
    });

    return new Response(Buffer.from(body), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Account document serve failed:", error);
    return NextResponse.json({ error: "Could not load document." }, { status: 500 });
  }
}
