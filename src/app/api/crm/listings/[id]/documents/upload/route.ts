import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/admin-auth";
import { canManageListings } from "@/lib/auth/roles";
import { canAccessListing, getSessionUser } from "@/lib/crm/access";
import { prisma } from "@/lib/db";
import {
  ALLOWED_DOCUMENT_TYPES,
  getPrivateBlobConfig,
  getPublicBlobConfig,
  isValidDocumentPathname,
  MAX_DOCUMENT_BYTES,
} from "@/lib/storage/blob";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user || !canManageListings(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await context.params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, assignedAgentId: true },
  });

  if (!listing || !canAccessListing(user, listing)) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const privateConfig = getPrivateBlobConfig();
  const publicConfig = getPublicBlobConfig();
  const usePrivate = privateConfig != null;
  const blobConfig = usePrivate ? privateConfig : publicConfig;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: blobConfig.token,
      onBeforeGenerateToken: async (pathname) => {
        if (!isValidDocumentPathname(pathname, listingId)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: [...ALLOWED_DOCUMENT_TYPES],
          maximumSizeInBytes: MAX_DOCUMENT_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            userId: user.id,
            listingId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("CRM document upload completed", blob.pathname, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
