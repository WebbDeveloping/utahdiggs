export const LISTING_STATUSES = [
  "ACTIVE",
  "UNDER_CONTRACT",
  "PENDING",
  "CLOSED",
  "CANCELLED",
] as const;

export type ListingStatusValue = (typeof LISTING_STATUSES)[number];

export const DEFAULT_LISTING_STATUS: ListingStatusValue = "ACTIVE";

const LISTING_STATUS_LABELS: Record<ListingStatusValue, string> = {
  ACTIVE: "Active",
  UNDER_CONTRACT: "Under Contract",
  PENDING: "Pending",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export function formatListingStatusLabel(status: ListingStatusValue): string {
  return LISTING_STATUS_LABELS[status];
}
