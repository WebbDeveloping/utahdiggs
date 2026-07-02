import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  UAR_FORM_8_MAPPED_VALUE_KEYS,
  UAR_FORM_8_TEMPLATE_VERSION,
} from "@/lib/signature/uar-form-8-field-map";

describe("uar-form-8-field-map", () => {
  it("pins the template version", () => {
    assert.equal(UAR_FORM_8_TEMPLATE_VERSION, "2024-11-05");
  });

  it("lists every resolved value we overlay on the template", () => {
    const expected = [
      "company",
      "agentName",
      "seller1FullName",
      "seller2FullName",
      "propertyFullAddress",
      "listingEndDate",
      "krFeePercent",
      "krFeeDollar",
      "ubFeePercent",
      "ubFeeDollar",
      "buyerAgentPercent",
      "buyerAgentDollar",
      "protectionPeriodMonths",
      "sellerDeniesBuyerCompAgreement",
      "disputeMediation",
      "sqFtSources",
      "sqFtOther",
      "attachmentTerms",
      "firptaStatus",
      "signedDate",
      "multipleOwners",
      "seller1AddressPhone",
      "seller2AddressPhone",
    ];

    assert.deepEqual([...UAR_FORM_8_MAPPED_VALUE_KEYS], expected);
  });
});
