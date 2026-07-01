import { MLS_INPUT_STEP_COUNT } from "@/lib/mls-input/schema";
import { buildMlsInputDraftPath, buildOnboardingPathForListing } from "@/lib/consumer/listing-prefill";
import {
  formatOnboardingStatus,
  isOnboardingInProgress,
  onboardingProgressPercent,
} from "@/lib/consumer/onboarding";
import { formatListingStatus, listingStatusColor } from "@/lib/crm/format";
import type { CustomerListingSummary } from "@/types/consumer-listing";

const MLS_DRAFT_STATUS = "DRAFT" as const;

export function isMlsDraft(listing: Pick<CustomerListingSummary, "intakeStatus">): boolean {
  return listing.intakeStatus === MLS_DRAFT_STATUS;
}

export function isOnboardingListing(
  listing: Pick<CustomerListingSummary, "onboardingStatus" | "submittedAt">,
): boolean {
  return isOnboardingInProgress(listing);
}

export function getMlsDraftResumePath(listingId: string): string {
  return buildMlsInputDraftPath(listingId);
}

export function getOnboardingResumePath(listingId: string): string {
  return buildOnboardingPathForListing(listingId);
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
  listing: Pick<
    CustomerListingSummary,
    "status" | "intakeStatus" | "onboardingStatus" | "submittedAt"
  >,
): string {
  if (isMlsDraft(listing)) {
    return "MLS intake in progress";
  }
  if (isOnboardingInProgress(listing)) {
    return formatOnboardingStatus(listing.onboardingStatus);
  }
  return formatListingStatus(listing.status);
}

export function consumerListingStatusColor(
  listing: Pick<
    CustomerListingSummary,
    "status" | "intakeStatus" | "onboardingStatus" | "submittedAt"
  >,
): "success" | "warning" | "info" | "default" | "error" {
  if (isMlsDraft(listing) || isOnboardingInProgress(listing)) {
    return "warning";
  }
  return listingStatusColor(listing.status);
}

export function formatListingProgressLabel(listing: CustomerListingSummary): string {
  if (isMlsDraft(listing)) {
    return formatMlsDraftProgress(listing.intakeCurrentStep);
  }
  if (isOnboardingInProgress(listing)) {
    return `Onboarding ${onboardingProgressPercent(listing)}% complete`;
  }
  return "";
}

export function getListingResumePath(listing: CustomerListingSummary): string {
  if (isMlsDraft(listing)) {
    return getMlsDraftResumePath(listing.id);
  }
  if (isOnboardingInProgress(listing)) {
    return getOnboardingResumePath(listing.id);
  }
  return `/account/listings/${listing.id}`;
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
