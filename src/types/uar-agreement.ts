import type { ServicePlan } from "@/generated/prisma/client";

export type UarDisputeMediation = "SHALL" | "MAY AT THE OPTION OF THE PARTIES";
export type UarAttachmentTerms = "ARE" | "ARE NOT";
export type UarFirptaStatus = "IS" | "IS NOT";
export type UarMultipleOwners = "YES" | "NO";

export type UarAgreementFormValues = {
  multipleOwners: UarMultipleOwners;
  seller1FirstName: string;
  seller1LastName: string;
  seller2FirstName: string;
  seller2LastName: string;
  propertyAddress: string;
  propertyUnit: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  buyerAgentPercent: string;
  buyerAgentDollar: string;
  sellerDeniesBuyerCompAgreement: boolean;
  disputeMediation: UarDisputeMediation;
  sqFtSources: string[];
  sqFtOther: string;
  attachmentTerms: UarAttachmentTerms;
  firptaStatus: UarFirptaStatus;
  sellerEmail: string;
  seller1Phone: string;
  seller2Email: string;
  seller2Phone: string;
  seller1SignatureUrl: string;
  seller1InitialsUrl: string;
  seller2SignatureUrl: string;
  seller2InitialsUrl: string;
  signatureMethod: "draw" | "type";
  signedDate: string;
};

export type UarAgreementPrefill = {
  company: string;
  agentName: string;
  listingTerm: string;
  krFeePercent: string;
  krFeeDollar: string;
  ubFeePercent: string;
  ubFeeDollar: string;
  protectionPeriodMonths: string;
  agentSignedDate: string;
  cancellationTerms: string;
};

export type UarAgreementResolvedValues = UarAgreementFormValues &
  UarAgreementPrefill & {
    seller1FullName: string;
    seller2FullName: string;
    propertyFullAddress: string;
    listingEndDate: string;
    planLabel: string;
    seller1AddressPhone: string;
    seller2AddressPhone: string;
  };

export type UarAgreementPrefillInput = {
  address: string;
  city: string;
  state: string;
  zip: string;
  sellerEmail: string;
  sellerFirstName?: string;
  sellerLastName?: string;
  servicePlan: ServicePlan;
};
