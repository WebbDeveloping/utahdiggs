import type { DocumentDispositionMode } from "@/lib/storage/serve-listing-document";

function dispositionQuery(mode: DocumentDispositionMode): string {
  return mode === "download" ? "attachment" : "inline";
}

export function buildAccountDocumentHref(
  listingId: string,
  documentId: string,
  mode: DocumentDispositionMode,
): string {
  return `/api/account/listings/${listingId}/documents/${documentId}?disposition=${dispositionQuery(mode)}`;
}

export function buildCrmDocumentHref(
  listingId: string,
  documentId: string,
  mode: DocumentDispositionMode,
): string {
  return `/api/crm/listings/${listingId}/documents/${documentId}?disposition=${dispositionQuery(mode)}`;
}
