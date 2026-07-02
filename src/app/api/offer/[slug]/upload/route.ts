import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  getPrivateBlobConfig,
  getPublicBlobConfig,
  isValidOfferDocumentPathname,
  MAX_DOCUMENT_BYTES,
  ALLOWED_OFFER_DOCUMENT_TYPES,
} from "@/lib/storage/blob";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { slug } = await context.params;

  const listing = await prisma.listing.findFirst({
    where: { listingSlug: slug },
    select: { id: true, status: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  if (listing.status !== ListingStatus.ACTIVE) {
    return NextResponse.json(
      { error: "This property is not currently accepting offers." },
      { status: 403 },
    );
  }

  const privateConfig = getPrivateBlobConfig();
  const publicConfig = getPublicBlobConfig();
  const blobConfig = privateConfig ?? publicConfig;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: blobConfig.token,
      onBeforeGenerateToken: async (pathname) => {
        if (!isValidOfferDocumentPathname(pathname, listing.id)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: [...ALLOWED_OFFER_DOCUMENT_TYPES],
          maximumSizeInBytes: MAX_DOCUMENT_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            listingId: listing.id,
            listingSlug: slug,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Offer document upload completed", blob.pathname, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
