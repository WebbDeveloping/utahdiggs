import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildUarAgreementPrefill,
  resolveUarAgreementValues,
} from "@/content/uar-listing-agreement";
import {
  buildDefaultUarAgreementFormValues,
  parseUarAgreementFormData,
} from "@/lib/signature/uar-agreement-schema";

function buildValidFormData(): FormData {
  const formData = new FormData();
  formData.set("multipleOwners", "NO");
  formData.set("seller1FirstName", "Jane");
  formData.set("seller1LastName", "Seller");
  formData.set("seller2FirstName", "");
  formData.set("seller2LastName", "");
  formData.set("propertyAddress", "123 Main St");
  formData.set("propertyUnit", "");
  formData.set("propertyCity", "Salt Lake City");
  formData.set("propertyState", "UT");
  formData.set("propertyZip", "84101");
  formData.set("buyerAgentPercent", "1.5");
  formData.set("buyerAgentDollar", "$10,000");
  formData.set("disputeMediation", "MAY AT THE OPTION OF THE PARTIES");
  formData.set("attachmentTerms", "ARE NOT");
  formData.set("firptaStatus", "IS NOT");
  formData.set("sellerEmail", "jane@example.com");
  formData.set("seller1Phone", "");
  formData.set("seller2Email", "");
  formData.set("seller2Phone", "");
  formData.set("seller1SignatureUrl", "https://example.com/signature.png");
  formData.set("seller1InitialsUrl", "https://example.com/initials.png");
  formData.set("seller2SignatureUrl", "");
  formData.set("seller2InitialsUrl", "");
  formData.set("signatureMethod", "draw");
  formData.set("signedDate", "2026-07-01");
  return formData;
}

describe("parseUarAgreementFormData", () => {
  it("parses a valid single-owner submission", () => {
    const result = parseUarAgreementFormData(buildValidFormData());

    assert.ok(result.values);
    assert.equal(result.values?.seller1FirstName, "Jane");
    assert.equal(result.values?.buyerAgentPercent, "1.5");
  });

  it("requires second seller fields when multiple owners is YES", () => {
    const formData = buildValidFormData();
    formData.set("multipleOwners", "YES");

    const result = parseUarAgreementFormData(formData);

    assert.ok(result.fieldErrors);
    assert.ok(result.fieldErrors?.seller2FirstName);
    assert.ok(result.fieldErrors?.seller2SignatureUrl);
    assert.ok(result.fieldErrors?.seller2Email);
  });

  it("parses seller 2 contact when multiple owners is YES", () => {
    const formData = buildValidFormData();
    formData.set("multipleOwners", "YES");
    formData.set("seller2FirstName", "John");
    formData.set("seller2LastName", "CoSeller");
    formData.set("seller2Email", "john@example.com");
    formData.set("seller2Phone", "(801) 555-9999");
    formData.set("seller2SignatureUrl", "https://example.com/s2-signature.png");
    formData.set("seller2InitialsUrl", "https://example.com/s2-initials.png");

    const result = parseUarAgreementFormData(formData);

    assert.ok(result.values);
    assert.equal(result.values?.seller2Email, "john@example.com");
    assert.equal(result.values?.seller2Phone, "(801) 555-9999");
  });

  it("builds default values from listing prefill", () => {
    const defaults = buildDefaultUarAgreementFormValues({
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
      sellerEmail: "jane@example.com",
      sellerFirstName: "Jane",
      sellerLastName: "Seller",
    });

    assert.equal(defaults.propertyAddress, "123 Main St");
    assert.equal(defaults.sellerEmail, "jane@example.com");
    assert.equal(defaults.multipleOwners, "NO");
    assert.equal(defaults.buyerAgentPercent, "2.5");
  });
});

describe("resolveUarAgreementValues", () => {
  it("combines form values with broker prefill", () => {
    const formValues = buildDefaultUarAgreementFormValues({
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
      sellerEmail: "jane@example.com",
      sellerFirstName: "Jane",
      sellerLastName: "Seller",
    });
    formValues.signedDate = "2026-07-01";
    formValues.seller1Phone = "(801) 555-1234";
    const prefill = buildUarAgreementPrefill({
      address: formValues.propertyAddress,
      city: formValues.propertyCity,
      state: formValues.propertyState,
      zip: formValues.propertyZip,
      sellerEmail: formValues.sellerEmail,
      servicePlan: "FULL_SERVICE",
    });

    const resolved = resolveUarAgreementValues(formValues, prefill, "FULL_SERVICE");

    assert.match(resolved.propertyFullAddress, /123 Main St/);
    assert.equal(resolved.seller1FullName, "Jane Seller");
    assert.equal(resolved.krFeePercent, "2.5");
    assert.equal(resolved.listingEndDate, "January 1, 2027");
    assert.equal(resolved.seller1AddressPhone, "jane@example.com · (801) 555-1234");
  });
});
