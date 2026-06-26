import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estimateMonthlyPayment,
  formatPricePerSqft,
  parseSqft,
} from "./listing-pricing";

describe("parseSqft", () => {
  it("parses formatted sqft strings", () => {
    assert.equal(parseSqft("3,898"), 3898);
    assert.equal(parseSqft("2150 sq ft"), 2150);
  });

  it("returns null for invalid values", () => {
    assert.equal(parseSqft(null), null);
    assert.equal(parseSqft(""), null);
    assert.equal(parseSqft("0"), null);
  });
});

describe("formatPricePerSqft", () => {
  it("formats price per square foot", () => {
    assert.equal(formatPricePerSqft(1_000_000, "3,898"), "$257 per ft²");
  });

  it("returns null when inputs are missing", () => {
    assert.equal(formatPricePerSqft(null, "3,898"), null);
    assert.equal(formatPricePerSqft(1_000_000, null), null);
  });
});

describe("estimateMonthlyPayment", () => {
  it("estimates P&I for a $1M list price", () => {
    const payment = estimateMonthlyPayment(1_000_000);
    assert.ok(payment != null);
    assert.ok(payment >= 5_040 && payment <= 5_070);
  });
});
