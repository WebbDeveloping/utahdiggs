import type { IntakeStatus, OnboardingStatus } from "@/generated/prisma/client";
import type {
  ListingStatusValue,
  OfferStatusValue,
} from "@/lib/crm/listing-status";

export type ConsumerListingDocument = {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
};

export type ConsumerListingOffer = {
  id: string;
  submittedDate: Date;
  offerPrice: string | null;
  buyersAgent: string | null;
  status: OfferStatusValue;
  contractPrice: string | null;
  settlementDate: Date | null;
  sellerConcessions: string | null;
  buyerDueDiligenceDeadline: Date | null;
  homeWarranty: string | null;
  financingAppraisalDeadline: Date | null;
  sellerDisclosureDeadline: Date | null;
};

export type ConsumerClosingTeamMember = {
  id: string;
  name: string;
  role: "ESCROW_OFFICER" | "TRANSACTION_COORDINATOR";
  company: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
};

export type ConsumerListingDetail = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: string | null;
  baths: string | null;
  sqft: string | null;
  mlsNumber: string | null;
  listPrice: string | null;
  listDate: Date | null;
  status: ListingStatusValue;
  portalSlug: string;
  blairNote: string | null;
  blairNoteDate: Date | null;
  priceReductionDate: Date | null;
  priceReductionCount: number;
  marketAvgDom: number | null;
  intakeStatus: IntakeStatus | null;
  submittedAt: Date | null;
  onboardingStatus: OnboardingStatus;
  documents: ConsumerListingDocument[];
  offers: ConsumerListingOffer[];
  escrowOfficer: ConsumerClosingTeamMember | null;
  transactionCoordinator: ConsumerClosingTeamMember | null;
};
