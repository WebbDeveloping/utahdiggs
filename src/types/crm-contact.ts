import type { OnboardingStatus, ServicePlan } from "@/generated/prisma/client";
import type { ContactRoleLabel } from "@/lib/crm/contact-roles";
import type {
  ListingStatusValue,
  SellerRequestStatusValue,
} from "@/lib/crm/listing-status";

export type CrmContactListingLink = {
  role: ContactRoleLabel;
  listing: {
    id: string;
    address: string;
    city: string;
    status: ListingStatusValue;
    listingSlug: string;
    assignedAgentId: string | null;
  };
};

export type CrmContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  listings: CrmContactListingLink[];
  totalListingCount: number;
};

export type CrmContactDetailListing = {
  role: ContactRoleLabel;
  listing: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    status: ListingStatusValue;
    listPrice: string | null;
    mlsNumber: string | null;
    listingSlug: string;
    onboardingStatus: OnboardingStatus;
    servicePlan: ServicePlan | null;
    agreementSignedAt: Date | null;
    scheduledCallAt: Date | null;
    assignedAgent: { id: string; name: string | null; email: string } | null;
    showingCount: number;
    offerCount: number;
    openRequestCount: number;
  };
};

export type CrmContactDetailRequest = {
  id: string;
  status: SellerRequestStatusValue;
  requestSummary: string | null;
  propertyAddress: string;
  submittedAt: Date;
  message: string | null;
  listingId: string;
};

export type CrmContactDetailAgreement = {
  id: string;
  listingId: string;
  listingAddress: string;
  signerName: string;
  signerEmail: string;
  signedAt: Date;
  agreementVersion: string;
  signedDocumentUrl: string | null;
};

export type CrmContactDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
  } | null;
  listings: CrmContactDetailListing[];
  requests: CrmContactDetailRequest[];
  agreements: CrmContactDetailAgreement[];
  activityTotals: {
    showings: number;
    offers: number;
    openRequests: number;
  };
};
