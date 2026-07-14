export function priceChangeRequestHref(listingId: string): string {
  return `/account/seller-requests/price-change?listing=${encodeURIComponent(listingId)}`;
}
