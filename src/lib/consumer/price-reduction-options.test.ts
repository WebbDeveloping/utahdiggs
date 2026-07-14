import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ceilToNearest5k,
  computeCustomPrice,
  computeOptionAPrice,
  computeOptionBPrice,
  parseMoneyInput,
  resolveRequestedPrice,
} from "./price-reduction-options";

describe("ceilToNearest5k", () => {
  it("leaves exact multiples unchanged", () => {
    assert.equal(ceilToNearest5k(500_000), 500_000);
  });

  it("rounds up to the next $5k", () => {
    assert.equal(ceilToNearest5k(477_500), 480_000);
    assert.equal(ceilToNearest5k(487_500), 490_000);
    assert.equal(ceilToNearest5k(1), 5_000);
  });
});

describe("computeOptionAPrice / computeOptionBPrice", () => {
  it("computes ~5% and ~3% drops rounded up to $5k", () => {
    assert.equal(computeOptionAPrice(500_000), 480_000);
    assert.equal(computeOptionBPrice(500_000), 490_000);
  });
});

describe("computeCustomPrice", () => {
  it("ceils custom input to $5k", () => {
    assert.equal(computeCustomPrice(497_000), 500_000);
    assert.equal(computeCustomPrice(495_000), 495_000);
  });
});

describe("parseMoneyInput", () => {
  it("parses currency-formatted strings", () => {
    assert.equal(parseMoneyInput("$490,000"), 490_000);
    assert.equal(parseMoneyInput("490000"), 490_000);
    assert.equal(parseMoneyInput(""), null);
    assert.equal(parseMoneyInput("abc"), null);
  });
});

describe("resolveRequestedPrice", () => {
  it("returns A and B prices", () => {
    assert.deepEqual(resolveRequestedPrice(500_000, "A"), {
      ok: true,
      newPrice: 480_000,
    });
    assert.deepEqual(resolveRequestedPrice(500_000, "B"), {
      ok: true,
      newPrice: 490_000,
    });
  });

  it("rejects custom at or above list after ceil", () => {
    const result = resolveRequestedPrice(500_000, "C", "497000");
    assert.equal(result.ok, false);
  });

  it("accepts a valid custom price", () => {
    assert.deepEqual(resolveRequestedPrice(500_000, "C", "$475,000"), {
      ok: true,
      newPrice: 475_000,
    });
  });
});
