import type {
  ListingStatus,
  OnboardingStatus,
  ServicePlan,
} from "@/generated/prisma/client";

export type OnboardingListingDetail = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  servicePlan: ServicePlan | null;
  onboardingStatus: OnboardingStatus;
  agreementSignedAt: Date | null;
  agreementSignatureUrl: string | null;
  signedAgreementDocumentId: string | null;
  proPhotoTourRequested: boolean;
  scheduledCallAt: Date | null;
  callNotes: string | null;
  submittedAt: Date | null;
  status: ListingStatus;
  portalSlug: string;
  sellerPhone: string;
  documents: {
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  listingIntake: {
    status: string;
    currentStep: number;
  } | null;
};

export type OnboardingActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};
