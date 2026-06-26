import { get } from "@vercel/blob";

export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTO_COUNT = 40;
export const PHOTO_PATH_PREFIX = "photos/";
export const DOCUMENT_PATH_PREFIX = "documents/";
export const OFFER_DOCUMENT_PATH_PREFIX = "offers/";

export const ALLOWED_OFFER_DOCUMENT_TYPES = ["application/pdf"] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export type BlobStoreConfig = {
  token: string;
  storeId?: string;
};

export function isAllowedPhotoType(contentType: string): boolean {
  return (ALLOWED_PHOTO_TYPES as readonly string[]).includes(contentType);
}

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "photo";
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return sanitized || "photo";
}

export function buildPhotoPathname(filename: string): string {
  const suffix = crypto.randomUUID();
  return `${PHOTO_PATH_PREFIX}${suffix}/${sanitizeFilename(filename)}`;
}

export function buildDocumentPathname(listingId: string, filename: string): string {
  const suffix = crypto.randomUUID();
  return `${DOCUMENT_PATH_PREFIX}${listingId}/${suffix}/${sanitizeFilename(filename)}`;
}

export function buildOfferDocumentPathname(
  listingId: string,
  filename: string,
): string {
  const suffix = crypto.randomUUID();
  return `${OFFER_DOCUMENT_PATH_PREFIX}${listingId}/${suffix}/${sanitizeFilename(filename)}`;
}

export function isValidPhotoPathname(pathname: string): boolean {
  return pathname.startsWith(PHOTO_PATH_PREFIX);
}

export function isValidDocumentPathname(pathname: string, listingId: string): boolean {
  return pathname.startsWith(`${DOCUMENT_PATH_PREFIX}${listingId}/`);
}

export function isValidOfferDocumentPathname(
  pathname: string,
  listingId: string,
): boolean {
  return pathname.startsWith(`${OFFER_DOCUMENT_PATH_PREFIX}${listingId}/`);
}

function blobUrlPathname(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

export function isAllowedOfferBlobUrl(url: string, listingId: string): boolean {
  const pathname = blobUrlPathname(url);
  if (!pathname || !isValidOfferDocumentPathname(pathname, listingId)) {
    return false;
  }

  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith(".public.blob.vercel-storage.com")) {
      return true;
    }
    if (hostname.endsWith(".blob.vercel-storage.com")) {
      return getPrivateBlobConfig() != null;
    }
  } catch {
    return false;
  }

  return false;
}

export function isAllowedDocumentType(contentType: string): boolean {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(contentType);
}

export function getPublicBlobConfig(): BlobStoreConfig {
  const token =
    process.env.BLOB_PUBLIC_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Public blob token is not set. Add BLOB_READ_WRITE_TOKEN (or BLOB_PUBLIC_READ_WRITE_TOKEN) from your public Vercel Blob store.",
    );
  }

  return {
    token,
    storeId:
      process.env.BLOB_PUBLIC_STORE_ID ?? process.env.BLOB_STORE_ID,
  };
}

export function getPrivateBlobConfig(): BlobStoreConfig | null {
  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (!token) return null;

  return {
    token,
    storeId: process.env.BLOB_PRIVATE_STORE_ID,
  };
}

export function isPublicBlobUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function isVercelBlobUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith(".public.blob.vercel-storage.com")) {
      return true;
    }
    if (hostname.endsWith(".blob.vercel-storage.com")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export async function servePrivateBlob(pathname: string) {
  const config = getPrivateBlobConfig();
  if (!config) {
    throw new Error(
      "BLOB_PRIVATE_READ_WRITE_TOKEN is not set. Create a private Vercel Blob store first.",
    );
  }

  return get(pathname, {
    access: "private",
    token: config.token,
    storeId: config.storeId,
  });
}
