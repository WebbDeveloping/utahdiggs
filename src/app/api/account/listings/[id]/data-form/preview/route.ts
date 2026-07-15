import { NextResponse } from "next/server";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";
import { buildDataFormPreviewPdf } from "@/lib/signature/build-data-form-preview-pdf";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getConsumerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await context.params;
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId: session.id },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const values =
    body &&
    typeof body === "object" &&
    "values" in body &&
    body.values &&
    typeof body.values === "object" &&
    !Array.isArray(body.values)
      ? (body.values as Record<string, unknown>)
      : null;

  if (!values) {
    return NextResponse.json(
      { error: "Request body must include a values object." },
      { status: 400 },
    );
  }

  try {
    const pdfBytes = await buildDataFormPreviewPdf(values);

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="uar-data-form-residential-preview.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Data Form preview PDF failed:", error);
    return NextResponse.json({ error: "Could not generate preview." }, { status: 500 });
  }
}
