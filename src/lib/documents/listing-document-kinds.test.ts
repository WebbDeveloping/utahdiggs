import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findSignedListingAgreementDocument,
  isListingAgreementDocument,
  LISTING_AGREEMENT_SIGNED_NAME,
  LEGACY_LISTING_AGREEMENT_SIGNED_NAME,
} from "@/lib/documents/listing-document-kinds";
import { buildListingDocumentsPath } from "@/lib/consumer/listing-documents-path";
import {
  hashUarAgreementSubmission,
  LISTING_AGREEMENT_VERSION,
} from "@/lib/signature/agreement-audit";
import { buildDefaultUarAgreementFormValues } from "@/lib/signature/uar-agreement-schema";

describe("listing document kinds", () => {
  it("recognizes current and legacy listing agreement names", () => {
    assert.equal(isListingAgreementDocument(LISTING_AGREEMENT_SIGNED_NAME), true);
    assert.equal(isListingAgreementDocument(LEGACY_LISTING_AGREEMENT_SIGNED_NAME), true);
    assert.equal(isListingAgreementDocument("MLS Input Signature"), false);
  });

  it("finds the signed listing agreement document", () => {
    const document = findSignedListingAgreementDocument([
      { id: "1", name: "MLS Input Signature" },
      { id: "2", name: LISTING_AGREEMENT_SIGNED_NAME },
    ]);

    assert.equal(document?.id, "2");
  });
});

describe("listing documents path", () => {
  it("builds the account documents route", () => {
    assert.equal(buildListingDocumentsPath("listing-123"), "/account/listings/listing-123/documents");
  });
});

describe("hashUarAgreementSubmission", () => {
  it("returns a stable sha256 hash for the same submission", () => {
    const formData = buildDefaultUarAgreementFormValues({
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
      sellerEmail: "jane@example.com",
    });

    const first = hashUarAgreementSubmission("VIRTUAL", formData);
    const second = hashUarAgreementSubmission("VIRTUAL", formData);

    assert.match(first, /^[a-f0-9]{64}$/);
    assert.equal(first, second);
  });

  it("uses the current agreement version constant", () => {
    assert.equal(LISTING_AGREEMENT_VERSION, "uar-form-8-template-2024-11-05");
  });
});
