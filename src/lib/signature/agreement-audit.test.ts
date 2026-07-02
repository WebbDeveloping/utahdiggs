import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hashSignedAgreementPdf,
  hashUarAgreementSubmission,
  LISTING_AGREEMENT_VERSION,
} from "@/lib/signature/agreement-audit";
import { buildDefaultUarAgreementFormValues } from "@/lib/signature/uar-agreement-schema";

describe("hashUarAgreementSubmission", () => {
  it("returns a stable sha256 hash for a service plan", () => {
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

  it("changes when the service plan changes", () => {
    const formData = buildDefaultUarAgreementFormValues({
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
      sellerEmail: "jane@example.com",
    });

    const virtual = hashUarAgreementSubmission("VIRTUAL", formData);
    const fullService = hashUarAgreementSubmission("FULL_SERVICE", formData);

    assert.notEqual(virtual, fullService);
  });

  it("uses the current agreement version constant", () => {
    assert.equal(LISTING_AGREEMENT_VERSION, "uar-form-8-template-2024-11-05");
  });
});

describe("hashSignedAgreementPdf", () => {
  it("returns a sha256 hash of PDF bytes", () => {
    const bytes = new TextEncoder().encode("%PDF-1.4 sample");
    const hash = hashSignedAgreementPdf(bytes);

    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.equal(hash, hashSignedAgreementPdf(bytes));
  });
});
