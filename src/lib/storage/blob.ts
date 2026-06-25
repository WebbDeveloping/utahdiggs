import { get } from "@vercel/blob";

export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTO_COUNT = 40;
export const PHOTO_PATH_PREFIX = "photos/";

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

export function isValidPhotoPathname(pathname: string): boolean {
  return pathname.startsWith(PHOTO_PATH_PREFIX);
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
