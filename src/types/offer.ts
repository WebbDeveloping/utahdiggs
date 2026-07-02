import type { ListingStatus } from "@/generated/prisma/client";

export type OfferFormListing = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  listPrice: string | null;
  mlsNumber: string | null;
  listingSlug: string;
  status: ListingStatus;
};

export const FINANCING_TYPE_OPTIONS = [
  "Conventional",
  "FHA",
  "VA",
  "Cash",
  "Other",
] as const;

export type FinancingType = (typeof FINANCING_TYPE_OPTIONS)[number];

export type OfferSubmissionInput = {
  listingSlug: string;
  buyersAgent: string;
  buyerAgentEmail: string;
  buyerAgentPhone: string;
  offerPrice: number;
  financingType: FinancingType;
  offerContractUrl: string;
  preApprovalUrl: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  earnestMoney?: number;
  closingDate?: Date;
  inspectionPeriod?: string;
  appraisalGap?: string;
  contingencies?: string;
  additionalTerms?: string;
};

export type OfferSubmissionFieldErrors = Partial<
  Record<
    | keyof OfferSubmissionInput
    | "offerContractUrl"
    | "preApprovalUrl"
    | "website",
    string
  >
>;

export type OfferSubmissionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: OfferSubmissionFieldErrors;
};
