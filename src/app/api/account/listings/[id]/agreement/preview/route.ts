import { NextResponse } from "next/server";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { splitSellerName } from "@/content/uar-listing-agreement";
import { getOnboardingListing } from "@/lib/consumer/onboarding-query";
import { buildAgreementPreviewPdf } from "@/lib/signature/build-agreement-preview-pdf";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getConsumerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await context.params;
  const listing = await getOnboardingListing(session.id, listingId);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  if (!listing.servicePlan) {
    return NextResponse.json(
      { error: "Choose a service plan before previewing the agreement." },
      { status: 400 },
    );
  }

  const { firstName, lastName } = splitSellerName(session.name);

  try {
    const pdfBytes = await buildAgreementPreviewPdf({
      servicePlan: listing.servicePlan,
      listing: {
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zip: listing.zip,
      },
      sellerEmail: session.email,
      sellerPhone: listing.sellerPhone,
      sellerFirstName: firstName,
      sellerLastName: lastName,
    });

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="uar-listing-agreement-preview.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Agreement preview PDF failed:", error);
    return NextResponse.json({ error: "Could not generate preview." }, { status: 500 });
  }
}
