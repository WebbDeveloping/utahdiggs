import { MLS_INPUT_STEP_COUNT } from "@/lib/mls-input/schema";
import { buildMlsInputDraftPath } from "@/lib/consumer/listing-prefill";
import { formatListingStatus, listingStatusColor } from "@/lib/crm/format";
import type { CustomerListingSummary } from "@/types/consumer-listing";

const MLS_DRAFT_STATUS = "DRAFT" as const;

export function isMlsDraft(listing: Pick<CustomerListingSummary, "intakeStatus">): boolean {
  return listing.intakeStatus === MLS_DRAFT_STATUS;
}

export function getMlsDraftResumePath(listingId: string): string {
  return buildMlsInputDraftPath(listingId);
}

export function getMlsDrafts(listings: CustomerListingSummary[]): CustomerListingSummary[] {
  return listings
    .filter(isMlsDraft)
    .sort((a, b) => {
      const aTime = a.intakeUpdatedAt?.getTime() ?? 0;
      const bTime = b.intakeUpdatedAt?.getTime() ?? 0;
      return bTime - aTime;
    });
}

export function formatMlsDraftProgress(step: number | null | undefined): string {
  const current = step ?? 1;
  return `Step ${current} of ${MLS_INPUT_STEP_COUNT}`;
}

export function formatConsumerListingStatus(
  listing: Pick<CustomerListingSummary, "status" | "intakeStatus">,
): string {
  if (isMlsDraft(listing)) {
    return "In progress";
  }
  return formatListingStatus(listing.status);
}

export function consumerListingStatusColor(
  listing: Pick<CustomerListingSummary, "status" | "intakeStatus">,
): "success" | "warning" | "info" | "default" | "error" {
  if (isMlsDraft(listing)) {
    return "warning";
  }
  return listingStatusColor(listing.status);
}

export function formatMlsDraftSavedAt(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
