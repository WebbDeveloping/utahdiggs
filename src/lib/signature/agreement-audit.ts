import { createHash } from "node:crypto";
import {
  buildUarAgreementPrefill,
  getUarBrokerConfig,
} from "@/content/uar-listing-agreement";
import type { ServicePlan } from "@/generated/prisma/client";
import type { UarAgreementFormValues } from "@/types/uar-agreement";

export const LISTING_AGREEMENT_VERSION = "uar-form-8-template-2024-11-05";

export function hashSignedAgreementPdf(pdfBytes: Uint8Array): string {
  return createHash("sha256").update(pdfBytes).digest("hex");
}

export function hashUarAgreementSubmission(
  plan: ServicePlan,
  formData: UarAgreementFormValues,
): string {
  const payload = JSON.stringify({
    version: LISTING_AGREEMENT_VERSION,
    plan,
    broker: getUarBrokerConfig(),
    prefill: buildUarAgreementPrefill({
      address: formData.propertyAddress,
      city: formData.propertyCity,
      state: formData.propertyState,
      zip: formData.propertyZip,
      sellerEmail: formData.sellerEmail,
      servicePlan: plan,
    }),
    formData,
  });

  return createHash("sha256").update(payload).digest("hex");
}

/** @deprecated Use hashUarAgreementSubmission */
export function hashListingAgreementContent(plan: ServicePlan): string {
  return hashUarAgreementSubmission(plan, {
    multipleOwners: "NO",
    seller1FirstName: "",
    seller1LastName: "",
    seller2FirstName: "",
    seller2LastName: "",
    propertyAddress: "",
    propertyUnit: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    buyerAgentPercent: "2.5",
    buyerAgentDollar: "",
    sellerDeniesBuyerCompAgreement: true,
    disputeMediation: "MAY AT THE OPTION OF THE PARTIES",
    sqFtSources: [],
    sqFtOther: "",
    attachmentTerms: "ARE NOT",
    firptaStatus: "IS NOT",
    sellerEmail: "",
    seller1Phone: "",
    seller2Email: "",
    seller2Phone: "",
    seller1SignatureUrl: "",
    seller1InitialsUrl: "",
    seller2SignatureUrl: "",
    seller2InitialsUrl: "",
    signatureMethod: "draw",
    signedDate: "",
  });
}

export async function getRequestAuditContext(): Promise<{
  ipAddress: string | null;
  userAgent: string | null;
}> {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? null;
  const userAgent = headersList.get("user-agent");

  return { ipAddress, userAgent };
}
