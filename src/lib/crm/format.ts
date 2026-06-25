import {
  ListingStatus,
  OfferStatus,
  SellerRequestStatus,
} from "@/generated/prisma/client";

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatListingStatus(status: ListingStatus): string {
  const labels: Record<ListingStatus, string> = {
    SUBMITTED: "Submitted",
    ACTIVE: "Active",
    UNDER_CONTRACT: "Under Contract",
    PENDING: "Pending",
    CLOSED: "Closed",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

export function listingStatusColor(
  status: ListingStatus,
): "success" | "warning" | "info" | "default" | "error" {
  switch (status) {
    case ListingStatus.SUBMITTED:
      return "info";
    case ListingStatus.ACTIVE:
      return "success";
    case ListingStatus.UNDER_CONTRACT:
    case ListingStatus.PENDING:
      return "warning";
    case ListingStatus.CLOSED:
      return "info";
    case ListingStatus.CANCELLED:
      return "default";
    default:
      return "default";
  }
}

export function formatOfferStatus(status: OfferStatus): string {
  const labels: Record<OfferStatus, string> = {
    PENDING_REVIEW: "Pending Review",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

export function formatSellerRequestStatus(status: SellerRequestStatus): string {
  const labels: Record<SellerRequestStatus, string> = {
    NEW: "New",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };
  return labels[status];
}
