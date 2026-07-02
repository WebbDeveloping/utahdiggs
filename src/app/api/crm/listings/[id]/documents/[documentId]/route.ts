import { NextResponse } from "next/server";
import { assertCrmListingAccess } from "@/lib/crm/document-actions";
import { prisma } from "@/lib/db";
import {
  parseDocumentDisposition,
  resolveListingDocumentResponse,
} from "@/lib/storage/serve-listing-document";

type RouteContext = {
  params: Promise<{ id: string; documentId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id: listingId, documentId } = await context.params;

  try {
    await assertCrmListingAccess(listingId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized.";
    const status = message === "Unauthorized." ? 401 : 404;
    return NextResponse.json({ error: message }, { status });
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
    console.error("CRM document serve failed:", error);
    return NextResponse.json({ error: "Could not load document." }, { status: 500 });
  }
}
