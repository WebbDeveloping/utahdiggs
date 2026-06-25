import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/admin-auth";
import { canManageListings } from "@/lib/auth/roles";
import {
  ALLOWED_PHOTO_TYPES,
  getPublicBlobConfig,
  isValidPhotoPathname,
  MAX_PHOTO_BYTES,
} from "@/lib/storage/blob";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id || !canManageListings(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let publicConfig;
  try {
    publicConfig = getPublicBlobConfig();
  } catch (error) {
    console.error("Blob public store not configured:", error);
    return NextResponse.json(
      { error: "Photo storage is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: publicConfig.token,
      onBeforeGenerateToken: async (pathname) => {
        if (!isValidPhotoPathname(pathname)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: [...ALLOWED_PHOTO_TYPES],
          maximumSizeInBytes: MAX_PHOTO_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("CRM photo upload completed", blob.pathname, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
