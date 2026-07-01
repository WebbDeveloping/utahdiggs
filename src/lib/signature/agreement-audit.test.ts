import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hashListingAgreementContent,
  LISTING_AGREEMENT_VERSION,
} from "@/lib/signature/agreement-audit";

describe("hashListingAgreementContent", () => {
  it("returns a stable sha256 hash for a service plan", () => {
    const first = hashListingAgreementContent("VIRTUAL");
    const second = hashListingAgreementContent("VIRTUAL");

    assert.match(first, /^[a-f0-9]{64}$/);
    assert.equal(first, second);
  });

  it("changes when the service plan changes", () => {
    const virtual = hashListingAgreementContent("VIRTUAL");
    const fullService = hashListingAgreementContent("FULL_SERVICE");

    assert.notEqual(virtual, fullService);
  });

  it("uses the current agreement version constant", () => {
    assert.equal(LISTING_AGREEMENT_VERSION, "listing-agreement-v1");
  });
});
