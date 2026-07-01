import type { OnboardingStatus, ServicePlan } from "@/generated/prisma/client";

export type OnboardingStepId =
  | "plan"
  | "agreement"
  | "photos"
  | "call"
  | "expectations"
  | "mls";

export type OnboardingStep = {
  id: OnboardingStepId;
  order: number;
  title: string;
  description: string;
  href: (listingId: string) => string;
  /** Steps that must be complete before this one is actionable */
  requires: OnboardingStepId[];
  /** If false, step is informational only (not gated) */
  required: boolean;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "plan",
    order: 1,
    title: "Choose your plan",
    description: "Virtual (1%) or Full Service (1.5%)",
    href: (id) => `/account/onboarding/${id}/plan`,
    requires: [],
    required: true,
  },
  {
    id: "agreement",
    order: 2,
    title: "Sign listing agreement",
    description: "Review and sign your Glide RE listing agreement",
    href: (id) => `/account/onboarding/${id}/agreement`,
    requires: ["plan"],
    required: true,
  },
  {
    id: "photos",
    order: 3,
    title: "Add photos",
    description: "Upload listing photos or request a professional tour",
    href: (id) => `/account/onboarding/${id}/photos`,
    requires: ["agreement"],
    required: true,
  },
  {
    id: "call",
    order: 4,
    title: "Schedule your call",
    description: "Pick a time to connect with our team",
    href: (id) => `/account/onboarding/${id}/call`,
    requires: ["photos"],
    required: true,
  },
  {
    id: "expectations",
    order: 5,
    title: "What to expect",
    description: "A quick overview of the listing process",
    href: (id) => `/account/onboarding/${id}#expectations`,
    requires: [],
    required: false,
  },
  {
    id: "mls",
    order: 6,
    title: "MLS listing intake",
    description: "Complete the full WFRMLS form (~20–25 min)",
    href: (id) => `/account/listings/new/mls-input?draft=${encodeURIComponent(id)}`,
    requires: ["call"],
    required: true,
  },
];

export type OnboardingListingFields = {
  id: string;
  onboardingStatus: OnboardingStatus;
  servicePlan: ServicePlan | null;
  agreementSignedAt: Date | null;
  scheduledCallAt: Date | null;
  submittedAt: Date | null;
  listingIntake?: { status: string } | null;
};

const STATUS_ORDER: OnboardingStatus[] = [
  "PLAN_PENDING",
  "AGREEMENT_PENDING",
  "PHOTOS_PENDING",
  "CALL_PENDING",
  "MLS_INTAKE_PENDING",
  "ONBOARDING_COMPLETE",
];

export function onboardingStatusIndex(status: OnboardingStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export function isOnboardingInProgress(
  listing: Pick<OnboardingListingFields, "onboardingStatus" | "submittedAt">,
): boolean {
  return listing.onboardingStatus !== "ONBOARDING_COMPLETE" && !listing.submittedAt;
}

export function isStepComplete(
  listing: OnboardingListingFields,
  stepId: OnboardingStepId,
): boolean {
  switch (stepId) {
    case "plan":
      return listing.servicePlan != null;
    case "agreement":
      return listing.agreementSignedAt != null;
    case "photos":
      return onboardingStatusIndex(listing.onboardingStatus) >=
        onboardingStatusIndex("CALL_PENDING");
    case "call":
      return listing.scheduledCallAt != null;
    case "expectations":
      return true;
    case "mls":
      return (
        listing.onboardingStatus === "ONBOARDING_COMPLETE" ||
        listing.listingIntake?.status === "SUBMITTED"
      );
    default:
      return false;
  }
}

export function isStepAccessible(
  listing: OnboardingListingFields,
  step: OnboardingStep,
): boolean {
  if (!step.required && step.id === "expectations") {
    return true;
  }
  return step.requires.every((requiredStep) => isStepComplete(listing, requiredStep));
}

export function getCurrentStepId(listing: OnboardingListingFields): OnboardingStepId {
  if (listing.onboardingStatus === "ONBOARDING_COMPLETE") {
    return "mls";
  }
  if (!listing.servicePlan) return "plan";
  if (!listing.agreementSignedAt) return "agreement";
  if (listing.onboardingStatus === "PHOTOS_PENDING") return "photos";
  if (!listing.scheduledCallAt) return "call";
  return "mls";
}

export function buildOnboardingPath(listingId: string): string {
  return `/account/onboarding/${listingId}`;
}

export function formatOnboardingStatus(status: OnboardingStatus): string {
  switch (status) {
    case "PLAN_PENDING":
      return "Choose plan";
    case "AGREEMENT_PENDING":
      return "Sign agreement";
    case "PHOTOS_PENDING":
      return "Add photos";
    case "CALL_PENDING":
      return "Schedule call";
    case "MLS_INTAKE_PENDING":
      return "MLS intake";
    case "ONBOARDING_COMPLETE":
      return "Onboarding complete";
    default:
      return status;
  }
}

export function formatServicePlan(plan: ServicePlan | null): string {
  if (!plan) return "—";
  return plan === "FULL_SERVICE" ? "Full Service (1.5%)" : "Virtual (1%)";
}

export function onboardingProgressPercent(listing: OnboardingListingFields): number {
  const requiredSteps = ONBOARDING_STEPS.filter((s) => s.required);
  const completed = requiredSteps.filter((s) => isStepComplete(listing, s.id)).length;
  return Math.round((completed / requiredSteps.length) * 100);
}

export const ONBOARDING_LISTING_PATH = "/account/onboarding";
