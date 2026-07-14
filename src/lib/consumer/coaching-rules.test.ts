import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPriceHealth } from "./coaching-rules";
import type { PriceHealthInput } from "./coaching-rules";

function base(overrides: Partial<PriceHealthInput> = {}): PriceHealthInput {
  return {
    status: "ACTIVE",
    daysOnMarket: 5,
    totalShowings: 2,
    showingsLastWeek: 1,
    pendingOfferCount: 0,
    daysSinceLastDrop: null,
    ...overrides,
  };
}

describe("getPriceHealth", () => {
  it("returns on_pace for early active listings", () => {
    const result = getPriceHealth(base());
    assert.equal(result.verdict, "on_pace");
    assert.equal(result.showPriceCta, false);
  });

  it("returns on_pace with no CTA when an offer is pending", () => {
    const result = getPriceHealth(
      base({ daysOnMarket: 30, totalShowings: 15, pendingOfferCount: 1 }),
    );
    assert.equal(result.verdict, "on_pace");
    assert.equal(result.showPriceCta, false);
    assert.match(result.why, /pending/i);
  });

  it("returns on_pace and suppresses CTA after a fresh price cut", () => {
    const result = getPriceHealth(
      base({ daysOnMarket: 30, totalShowings: 15, daysSinceLastDrop: 5 }),
    );
    assert.equal(result.verdict, "on_pace");
    assert.equal(result.showPriceCta, false);
    assert.match(result.why, /giving the new price time/i);
  });

  it("returns price_review via DOM ≥ 21", () => {
    const result = getPriceHealth(base({ daysOnMarket: 25, totalShowings: 3 }));
    assert.equal(result.verdict, "price_review");
    assert.equal(result.showPriceCta, true);
  });

  it("returns price_review via showings ≥ 10", () => {
    const result = getPriceHealth(base({ daysOnMarket: 15, totalShowings: 10 }));
    assert.equal(result.verdict, "price_review");
    assert.equal(result.showPriceCta, true);
  });

  it("returns watch for DOM ≥ 12 without price-review gates", () => {
    const result = getPriceHealth(base({ daysOnMarket: 14, totalShowings: 4 }));
    assert.equal(result.verdict, "watch");
    assert.equal(result.showPriceCta, false);
  });

  it("returns watch for soft recent showings after day 14", () => {
    const result = getPriceHealth(
      base({ daysOnMarket: 16, totalShowings: 5, showingsLastWeek: 1 }),
    );
    assert.equal(result.verdict, "watch");
    assert.equal(result.showPriceCta, false);
  });

  it("returns on_pace for under contract / closed statuses", () => {
    for (const status of ["UNDER_CONTRACT", "PENDING", "CLOSED", "CANCELLED"] as const) {
      const result = getPriceHealth(base({ status, daysOnMarket: 40, totalShowings: 20 }));
      assert.equal(result.verdict, "on_pace");
      assert.equal(result.showPriceCta, false);
    }
  });

  it("allows CTA again when days since drop is 19+", () => {
    const result = getPriceHealth(
      base({ daysOnMarket: 30, totalShowings: 12, daysSinceLastDrop: 19 }),
    );
    assert.equal(result.verdict, "price_review");
    assert.equal(result.showPriceCta, true);
  });
});
