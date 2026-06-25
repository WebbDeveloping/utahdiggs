export const LISTING_STATUSES = [
  "SUBMITTED",
  "ACTIVE",
  "UNDER_CONTRACT",
  "PENDING",
  "CLOSED",
  "CANCELLED",
] as const;

export type ListingStatusValue = (typeof LISTING_STATUSES)[number];

export const CRM_LISTING_STATUSES = LISTING_STATUSES.filter(
  (status) => status !== "SUBMITTED",
) as Exclude<ListingStatusValue, "SUBMITTED">[];

export const DEFAULT_LISTING_STATUS: ListingStatusValue = "ACTIVE";

const LISTING_STATUS_LABELS: Record<ListingStatusValue, string> = {
  SUBMITTED: "Submitted",
  ACTIVE: "Active",
  UNDER_CONTRACT: "Under Contract",
  PENDING: "Pending",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export function formatListingStatusLabel(status: ListingStatusValue): string {
  return LISTING_STATUS_LABELS[status];
}
