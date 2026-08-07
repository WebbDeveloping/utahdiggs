import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyClearDependents } from "./clear-dependents";
import {
  formatMlsAgreementDate,
  listingAgreementDateDefaults,
} from "./staff-defaults";

describe("applyClearDependents", () => {
  it("clears HOA follow-ups when HOA flips to No", () => {
    const result = applyClearDependents(
      {
        hoa: "Yes",
        hoaFeeMonth: "150",
        hoaAmenities: ["Pool"],
        listingPrice: "500000",
      },
      "hoa",
      "No",
    );
    assert.equal(result.hoa, "No");
    assert.equal(result.hoaFeeMonth, undefined);
    assert.equal(result.hoaAmenities, undefined);
    assert.equal(result.listingPrice, "500000");
  });

  it("keeps HOA follow-ups when still Yes", () => {
    const result = applyClearDependents(
      { hoa: "Yes", hoaFeeMonth: "150" },
      "hoa",
      "Yes",
    );
    assert.equal(result.hoaFeeMonth, "150");
  });

  it("clears directions when non-standard address flips to No", () => {
    const result = applyClearDependents(
      {
        nonStandardAddress: "Yes",
        directionsRemarks: "Dirt road past the barn",
      },
      "nonStandardAddress",
      "No",
    );
    assert.equal(result.directionsRemarks, undefined);
  });

  it("autofills owner showing contacts when occupancy is Owner Occupied", () => {
    const result = applyClearDependents(
      {
        ownerCount: "Two",
        primaryOwnerName: { first: "Jane", last: "Seller" },
        primaryOwnerPhone: "8015551234",
        primaryOwnerEmail: "jane@example.com",
        secondaryOwnerName: { first: "John", last: "Seller" },
        secondaryOwnerPhone: "8015559999",
        secondaryOwnerEmail: "john@example.com",
      },
      "q191-propertyoccupancy",
      "Owner Occupied",
    );
    assert.equal(result["q192-howmany"], "Two");
    assert.deepEqual(result["q194-ownershowing"], { first: "Jane", last: "Seller" });
    assert.equal(result["q195-phonenumber"], "8015551234");
    assert.deepEqual(result["q197-ownershowing197"], { first: "John", last: "Seller" });
  });

  it("clears contact 2 when owner showing count flips to One", () => {
    const result = applyClearDependents(
      {
        "q191-propertyoccupancy": "Owner Occupied",
        "q192-howmany": "Two",
        "q197-ownershowing197": { first: "John", last: "Seller" },
      },
      "q192-howmany",
      "One",
    );
    assert.equal(result["q197-ownershowing197"], undefined);
  });
});

describe("listingAgreementDateDefaults", () => {
  it("formats MM/DD/YYYY and adds six months", () => {
    const signed = new Date(2026, 0, 15); // Jan 15, 2026 local
    assert.equal(formatMlsAgreementDate(signed), "01/15/2026");
    const dates = listingAgreementDateDefaults(signed);
    assert.equal(dates.listingEffectiveDate, "01/15/2026");
    assert.equal(dates.listingExpirationDate, "07/15/2026");
  });
});
