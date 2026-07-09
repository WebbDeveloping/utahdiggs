import type {
  ListingStatusValue,
  OfferStatusValue,
  SellerRequestStatusValue,
} from "@/lib/crm/listing-status";
import { formatCallDateTime } from "@/lib/consumer/call-datetime";

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

export function formatListingStatus(status: ListingStatusValue): string {
  const labels: Record<ListingStatusValue, string> = {
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
  status: ListingStatusValue,
): "success" | "warning" | "info" | "default" | "error" {
  switch (status) {
    case "SUBMITTED":
      return "info";
    case "ACTIVE":
      return "success";
    case "UNDER_CONTRACT":
    case "PENDING":
      return "warning";
    case "CLOSED":
      return "info";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
}

export function formatOfferStatus(status: OfferStatusValue): string {
  const labels: Record<OfferStatusValue, string> = {
    PENDING_REVIEW: "Pending Review",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

export function offerStatusColor(
  status: OfferStatusValue,
): "success" | "warning" | "info" | "default" | "error" {
  switch (status) {
    case "PENDING_REVIEW":
      return "warning";
    case "ACCEPTED":
      return "success";
    case "DECLINED":
    case "EXPIRED":
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
}

export function formatSellerRequestStatus(status: SellerRequestStatusValue): string {
  const labels: Record<SellerRequestStatusValue, string> = {
    NEW: "New",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };
  return labels[status];
}

export function formatScheduledCallAt(date: Date | null | undefined): string {
  if (!date) return "—";
  return formatCallDateTime(date);
}
