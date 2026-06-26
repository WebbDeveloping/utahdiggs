import { DOCUMENT_PATH_PREFIX, PHOTO_PATH_PREFIX } from "@/lib/storage/blob";

const IMAGE_EXTENSION = /\.(jpe?g|png|webp)$/i;

export type ClassifiableDocument = {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date | string;
};

function blobUrlPathname(url: string): string | null {
  try {
    return new URL(url).pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

function hasImageExtension(value: string): boolean {
  return IMAGE_EXTENSION.test(value);
}

export function isListingPhoto(doc: Pick<ClassifiableDocument, "name" | "url">): boolean {
  const pathname = blobUrlPathname(doc.url) ?? "";

  if (pathname.startsWith(PHOTO_PATH_PREFIX)) {
    return true;
  }

  if (pathname.startsWith(DOCUMENT_PATH_PREFIX)) {
    return false;
  }

  return hasImageExtension(doc.name) || hasImageExtension(doc.url);
}

export function partitionListingDocuments<T extends ClassifiableDocument>(
  documents: T[],
): { photos: T[]; otherDocuments: T[] } {
  const photos: T[] = [];
  const otherDocuments: T[] = [];

  for (const doc of documents) {
    if (isListingPhoto(doc)) {
      photos.push(doc);
    } else {
      otherDocuments.push(doc);
    }
  }

  return { photos, otherDocuments };
}

export function getPrimaryListingPhotoUrl(
  documents: Pick<ClassifiableDocument, "name" | "url">[],
): string | null {
  for (const doc of documents) {
    if (isListingPhoto(doc)) {
      return doc.url;
    }
  }
  return null;
}
