import type { ListingStatus } from "@/generated/prisma/client";

export function formatPrice(price: number | null): string {
  if (price === null) return "Price TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatShortPrice(price: number | null): string {
  if (price === null) return "TBD";
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `$${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  if (price >= 1_000) {
    const thousands = Math.round(price / 1_000);
    return `$${thousands}K`;
  }
  return formatPrice(price);
}

export function formatAddress(listing: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): string {
  return `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
}

export function getStatusLabel(status: ListingStatus): string | null {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "UNDER_CONTRACT":
    case "PENDING":
      return "Contingent";
    default:
      return null;
  }
}

export const UTAH_CENTER: [number, number] = [39.32, -111.09];
export const DEFAULT_ZOOM = 7;

export function normalizeCoordinate(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(num)) return null;
  return num;
}

export function hasValidMapCoordinates<T extends { latitude: number | null; longitude: number | null }>(
  listing: T,
): listing is T & { latitude: number; longitude: number } {
  return (
    normalizeCoordinate(listing.latitude) !== null &&
    normalizeCoordinate(listing.longitude) !== null
  );
}
