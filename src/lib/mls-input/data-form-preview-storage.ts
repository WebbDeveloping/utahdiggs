/** sessionStorage key for live MLS wizard values used by the Data Form preview page. */
export function mlsDataFormPreviewStorageKey(listingId: string): string {
  return `mls-data-form-preview:${listingId}`;
}

export function buildDataFormPreviewPath(listingId: string): string {
  return `/account/listings/${listingId}/data-form/preview`;
}
