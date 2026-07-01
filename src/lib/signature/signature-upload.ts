import { upload } from "@vercel/blob/client";
import {
  buildDocumentPathname,
  buildPhotoPathname,
  type BlobAccess,
} from "@/lib/storage/blob";

export async function uploadSignatureBlob(
  blob: Blob,
  listingId?: string,
  documentAccess: BlobAccess = "public",
): Promise<string> {
  const file = new File([blob], "signature.png", { type: "image/png" });
  const isDocument = Boolean(listingId);
  const pathname = isDocument
    ? buildDocumentPathname(listingId!, file.name)
    : buildPhotoPathname(file.name);
  const handleUploadUrl = isDocument
    ? `/api/account/listings/${listingId}/documents/upload`
    : "/api/account/uploads";
  const access: BlobAccess = isDocument ? documentAccess : "public";

  const result = await upload(pathname, file, {
    access,
    handleUploadUrl,
  });

  return result.url;
}
