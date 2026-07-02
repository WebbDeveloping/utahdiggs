import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRightToSellAgreementDocument,
  computeListingEndDate,
  RIGHT_TO_SELL_FIXED_FEES,
} from "@/content/right-to-sell-agreement";
import {
  buildUarAgreementPrefill,
  resolveUarAgreementValues,
} from "@/content/uar-listing-agreement";
import { buildDefaultUarAgreementFormValues } from "@/lib/signature/uar-agreement-schema";

describe("computeListingEndDate", () => {
  it("adds six months to the signed date", () => {
    assert.equal(computeListingEndDate("2026-07-01"), "January 1, 2027");
  });
});

describe("buildRightToSellAgreementDocument", () => {
  it("includes fixed fee language and computed end date", () => {
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

    const prefill = buildUarAgreementPrefill({
      address: formValues.propertyAddress,
      city: formValues.propertyCity,
      state: formValues.propertyState,
      zip: formValues.propertyZip,
      sellerEmail: formValues.sellerEmail,
      servicePlan: "FULL_SERVICE",
    });
    const resolved = resolveUarAgreementValues(formValues, prefill, "FULL_SERVICE");
    const document = buildRightToSellAgreementDocument(resolved);

    assert.match(document, /2\.5%/);
    assert.match(document, /1\.5%/);
    assert.match(document, /January 1, 2027/);
    assert.match(document, /4\. SELLER WARRANTIES\/DISCLOSURES/);
    assert.match(document, /13\. EQUAL HOUSING OPPORTUNITY/);
    assert.equal(resolved.krFeePercent, RIGHT_TO_SELL_FIXED_FEES.krFeePercent);
  });
});
