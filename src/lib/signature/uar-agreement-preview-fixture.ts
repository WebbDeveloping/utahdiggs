import {
  buildUarAgreementPrefill,
  resolveUarAgreementValues,
} from "@/content/uar-listing-agreement";
import { SignatureMethod } from "@/generated/prisma/client";
import { LISTING_AGREEMENT_VERSION } from "@/lib/signature/agreement-audit";
import { buildDefaultUarAgreementFormValues } from "@/lib/signature/uar-agreement-schema";
import type { UarAgreementPdfInput } from "@/lib/signature/uar-agreement-pdf-input";

const MINIMAL_PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
  0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
  0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
  0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

export function buildUarAgreementPreviewInput(): UarAgreementPdfInput {
  const signedAt = new Date("2026-07-01T18:30:00.000Z");
  const formValues = buildDefaultUarAgreementFormValues({
    address: "1847 E Millcreek Way",
    city: "Salt Lake City",
    state: "UT",
    zip: "84109",
    sellerEmail: "michael.anderson@example.com",
    sellerPhone: "(801) 555-0142",
    sellerFirstName: "Michael",
    sellerLastName: "Anderson",
  });
  formValues.buyerAgentPercent = "2.5";
  formValues.buyerAgentDollar = "10000";
  formValues.signedDate = "2026-07-01";
  formValues.multipleOwners = "YES";
  formValues.seller2FirstName = "Sarah";
  formValues.seller2LastName = "Anderson";
  formValues.seller2Email = "sarah.anderson@example.com";
  formValues.seller2Phone = "(801) 555-0143";
  formValues.sqFtSources = ["County Records"];
  formValues.sqFtOther = "Measured by listing agent";

  const prefill = buildUarAgreementPrefill({
    address: formValues.propertyAddress,
    city: formValues.propertyCity,
    state: formValues.propertyState,
    zip: formValues.propertyZip,
    sellerEmail: formValues.sellerEmail,
    servicePlan: "VIRTUAL",
  });

  return {
    values: resolveUarAgreementValues(formValues, prefill, "VIRTUAL"),
    audit: {
      signerName: "Michael Anderson",
      signerEmail: "michael.anderson@example.com",
      signatureMethod: SignatureMethod.TYPE,
      signedAt,
      agreementVersion: LISTING_AGREEMENT_VERSION,
      agreementHash: "abc123",
      ipAddress: "127.0.0.1",
      userAgent: "TestAgent/1.0",
    },
    seller1SignaturePngBytes: MINIMAL_PNG,
    seller1InitialsPngBytes: MINIMAL_PNG,
  };
}

export { MINIMAL_PNG };
