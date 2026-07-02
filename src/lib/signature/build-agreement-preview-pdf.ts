import {
  buildUarAgreementPrefill,
  resolveUarAgreementValues,
} from "@/content/uar-listing-agreement";
import type { ServicePlan } from "@/generated/prisma/client";
import { SignatureMethod } from "@/generated/prisma/client";
import {
  hashUarAgreementSubmission,
  LISTING_AGREEMENT_VERSION,
} from "@/lib/signature/agreement-audit";
import { generateFinalUarForm8Pdf } from "@/lib/signature/fill-uar-form-8-template";
import { PREVIEW_SIGNATURE_PLACEHOLDER_PNG } from "@/lib/signature/preview-signature-placeholder";
import { buildDefaultUarAgreementFormValues } from "@/lib/signature/uar-agreement-schema";

export type BuildAgreementPreviewPdfInput = {
  servicePlan: ServicePlan;
  listing: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  sellerEmail: string;
  sellerPhone?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
};

export async function buildAgreementPreviewPdf(
  input: BuildAgreementPreviewPdfInput,
): Promise<Uint8Array> {
  const formValues = buildDefaultUarAgreementFormValues({
    address: input.listing.address,
    city: input.listing.city,
    state: input.listing.state,
    zip: input.listing.zip,
    sellerEmail: input.sellerEmail,
    sellerPhone: input.sellerPhone,
    sellerFirstName: input.sellerFirstName,
    sellerLastName: input.sellerLastName,
  });

  const signerName = `${formValues.seller1FirstName} ${formValues.seller1LastName}`.trim();
  const signedAt = new Date();
  const prefill = buildUarAgreementPrefill({
    address: formValues.propertyAddress,
    city: formValues.propertyCity,
    state: formValues.propertyState,
    zip: formValues.propertyZip,
    sellerEmail: formValues.sellerEmail,
    servicePlan: input.servicePlan,
  });
  const values = resolveUarAgreementValues(formValues, prefill, input.servicePlan);
  const formSubmissionHash = hashUarAgreementSubmission(input.servicePlan, formValues);

  const { pdfBytes } = await generateFinalUarForm8Pdf({
    values,
    audit: {
      signerName: signerName || "Preview Seller",
      signerEmail: input.sellerEmail,
      signatureMethod: SignatureMethod.TYPE,
      signedAt,
      agreementVersion: LISTING_AGREEMENT_VERSION,
      agreementHash: formSubmissionHash,
      ipAddress: null,
      userAgent: "AgreementPreview/1.0",
    },
    seller1SignaturePngBytes: PREVIEW_SIGNATURE_PLACEHOLDER_PNG,
    seller1InitialsPngBytes: PREVIEW_SIGNATURE_PLACEHOLDER_PNG,
  });

  return pdfBytes;
}
