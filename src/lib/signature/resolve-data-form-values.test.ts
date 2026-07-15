import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDataFormValues } from "@/lib/signature/resolve-data-form-values";
import type { FullMlsInputValues } from "@/lib/mls-input/validation";

function buildFixture(overrides: Partial<FullMlsInputValues> = {}): FullMlsInputValues {
  return {
    ownerCount: "One",
    primaryOwnerName: { first: "Jane", last: "Seller" },
    primaryOwnerPhone: "8015551234",
    primaryOwnerEmail: "jane@example.com",
    secondaryOwnerName: { first: "John", last: "Seller" },
    secondaryOwnerPhone: "8015559999",
    secondaryOwnerEmail: "john@example.com",
    listingAddress: {
      street: "123 Main Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    listingCounty: "Salt Lake",
    listingQuadrant: "NE",
    nonStandardAddress: "No",
    directionsRemarks: "n/a",
    ownerAddressSameAsListing: "Yes",
    ownerAddress: {
      street: "123 Main Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    listingPrice: "$525,000",
    shortSale: "Not Short Sale",
    schools: {
      "School District": { name: "Granite School District" },
      "Elementary School": { name: "Whittier Elementary" },
      "Junior High/Middle School": { name: "Bryant Middle" },
      "High School": { name: "East High" },
    },
    hoa: "Yes",
    hoaFeeMonth: "85",
    hoaFeeFrequency: "Monthly",
    hoaContact: "HOA Board",
    hoaContactPhone: "8015550000",
    shortTermRentals: "No",
    projectRestriction: "No",
    seniorCommunity: "No",
    maintenanceFree: "No",
    solar: "No",
    solarOwnership: "Owned",
    solarYearInstalled: "",
    "q11-propertytype": "Single Family",
    constructionStatus: "Built/Standing",
    "q51-styleof51": "2-Story",
    yearBuilt: "1998",
    taxParcelNumber: "12-34-56-789",
    noAssignedParcelNumber: "No",
    pud: "No",
    pid: "No",
    lotSize: "0.18",
    livingSqft: "2400",
    adu: "No",
    aduType: "Attached",
    aduKitchen: "Yes",
    aduSeparateEntrance: "Yes",
    aduSeparateWaterMeter: "No",
    aduSeparateGasMeter: "No",
    aduSeparateElectricMeter: "No",
    aduCurrentlyRented: "No",
    aduMonthlyRent: "0",
    levelCount: "2",
    "q26-typea26": ["Full"],
    basementFinished: "Partial",
    "q117-2level117": {
      "Main Level": {
        "square-footage": "1400",
        bedrooms: "3",
        "full-baths": "2",
        "3-4-baths": "0",
        "1-2-baths": "1",
      },
      Basement: {
        "square-footage": "1000",
        bedrooms: "1",
        "full-baths": "0",
        "3-4-baths": "0",
        "1-2-baths": "0",
      },
    },
    "q33-flooring": ["Hardwood", "Carpet"],
    "q34-typea34": ["Vaulted Ceilings"],
    "q27-typea27": ["None"],
    "q41-window-coverings": ["Blinds"],
    "q42-amenities": ["None"],
    "q31-airconditioning": ["Central Air; Gas"],
    "q96-hvac96": ["Gas", "Furnace / Forced Air"],
    "q32-typea32": ["Stucco"],
    "q29-typea29": ["Deck: Covered"],
    "q30-typea30": ["Garage", "Attached"],
    "q28-typea28": ["Concrete"],
    "q184-doesthe": "No",
    "q63-pooltype": ["None"],
    "q37-typea37": ["Asphalt Shingles"],
    "q36-typea36": ["Full Landscaping"],
    "q43-lot-facts": ["Curb & Gutter", "Terrain, Flat"],
    petsAllowed: "No",
    "q47-animals": [],
    "q39-typea39": ["Garage"],
    "q35-connectedutilities": ["Natural Gas", "Power", "Sewer"],
    "q44-water": ["Culinary"],
    "q45-telecommunications": ["Fiber"],
    "q38-zoning": ["Single-Family"],
    "q40-typea40": ["Cash", "Conventional Loan"],
    "q191-propertyoccupancy": "Owner Occupied",
    "q97-publicremarks": "Nice home near parks.",
    "q20-signature": "https://example.com/signature.png",
    "q20-initials": "https://example.com/initials.png",
    "q23-signature23": "",
    "q23-initials": "",
    ...overrides,
  } as FullMlsInputValues;
}

describe("resolveDataFormValues", () => {
  it("maps address, price, schools, and owner text fields", () => {
    const result = resolveDataFormValues(buildFixture(), { signedDate: "07/14/2026" });

    assert.equal(result.text.houseNumber, "123");
    assert.equal(result.text.streetName, "Main Street");
    assert.equal(result.text.city, "Salt Lake City");
    assert.equal(result.text.listPrice, "525000");
    assert.equal(result.text.schoolDistrict, "Granite School District");
    assert.equal(result.text.elementarySchool, "Whittier Elementary");
    assert.equal(result.text.ownerName, "Jane Seller");
    assert.equal(result.text.approxSqFt, "2400");
    assert.equal(result.text.beds, "4");
    assert.equal(result.text.bathsFull, "2");
    assert.equal(result.text.bathsHalf, "1");
    assert.equal(result.text.signedDate, "07/14/2026");
    assert.equal(result.text.hoaFee, "85");
  });

  it("sets required MVP checkboxes from intake answers", () => {
    const result = resolveDataFormValues(buildFixture());

    assert.equal(result.checkboxes.hoa_Yes, true);
    assert.equal(result.checkboxes.hoa_No, undefined);
    assert.equal(result.checkboxes.hasSolar_No, true);
    assert.equal(result.checkboxes["propertyType_Single Family"], true);
    assert.equal(result.checkboxes["constructionStatus_Built /Standing"], true);
    assert.equal(result.checkboxes["style_2-Story"], true);
    assert.equal(result.checkboxes.flooring_Hardwood, true);
    assert.equal(result.checkboxes.flooring_Carpet, true);
    assert.equal(result.checkboxes.poolAvailable_No, true);
    assert.equal(result.checkboxes["terms_Conventional"], true);
    assert.equal(result.checkboxes["utilities_Gas: Connected"], true);
    assert.equal(result.checkboxes["showInstructions_Call Owner / Appt"], true);
  });

  it("includes the primary owner signature image URL", () => {
    const result = resolveDataFormValues(buildFixture());
    assert.equal(result.images.owner1Signature, "https://example.com/signature.png");
  });

  it("stamps primary initials on every Data Form page", () => {
    const result = resolveDataFormValues(buildFixture(), { signedDate: "07/14/2026" });
    assert.equal(result.images.page0Initials, "https://example.com/initials.png");
    assert.equal(result.images.page5Initials, "https://example.com/initials.png");
    assert.equal(result.text.page0InitialsDate, "07/14/2026");
    assert.equal(result.text.page5InitialsDate, "07/14/2026");
  });

  it("maps page-1 address directionals, coords, subdivision, and HOA extras", () => {
    const result = resolveDataFormValues(
      buildFixture({
        houseNumberDirection: "S",
        streetDirection: "E",
        coordNorthSouth: "2100",
        coordEastWest: "1300",
        projectSubdivision: "Daybreak",
        otherSchool: "Private Academy",
        hoaFeeFrequency: "Quarterly",
        hoaChangeFeeType: "Dollar amount",
        hoaChangeFeeAmount: "500",
        hoaRentalCap: "Yes",
        hoaAmenities: ["Pool", "Club House", "Pickleball Court"],
      }),
    );

    assert.equal(result.checkboxes.houseDir_S, true);
    assert.equal(result.checkboxes.streetDir_E, true);
    assert.equal(result.text.coordNorthSouth, "2100");
    assert.equal(result.text.coordEastWest, "1300");
    assert.equal(result.text.projectSubdivision, "Daybreak");
    assert.equal(result.text.otherSchool, "Private Academy");
    assert.equal(result.checkboxes.hoaFee_Quarterly, true);
    assert.equal(result.checkboxes["hoaChangeFee_Dollar amount"], true);
    assert.equal(result.text.hoaChangeFeeAmount, "500");
    assert.equal(result.checkboxes.hoaRentalCap_Yes, true);
    assert.equal(result.checkboxes["hoaAmenities_Pool"], true);
    assert.equal(result.checkboxes["hoaAmenities_Club House"], true);
    assert.equal(result.checkboxes.hoaContactPhone_Voice, true);
    assert.equal(result.checkboxes.projectRestriction_No, true);
    assert.equal(result.checkboxes.seniorCommunity_No, true);
    assert.equal(result.checkboxes.maintenanceFree_No, true);
  });

  it("maps solar ownership when solar is Yes", () => {
    const result = resolveDataFormValues(
      buildFixture({
        solar: "Yes",
        solarOwnership: "Leased",
        solarCompanyName: "SunRun",
        solarYearInstalled: "2021",
      }),
    );

    assert.equal(result.checkboxes.hasSolar_Yes, true);
    assert.equal(result.checkboxes["solarOwnership_Solar Leased"], true);
    assert.equal(result.text.solarLeasingCompany, "SunRun");
    assert.equal(result.text.solarInstallDate, "2021");
  });

  it("maps financed solar and pet details", () => {
    const financed = resolveDataFormValues(
      buildFixture({
        solar: "Yes",
        solarOwnership: "Financed",
        solarFinanceCompany: "GreenSky",
        solarYearInstalled: "06/2022",
      }),
    );
    assert.equal(financed.checkboxes["solarOwnership_Solar Financed"], true);
    assert.equal(financed.text.solarFinanceCompany, "GreenSky");
    assert.equal(financed.text.solarLeasingCompany, "");

    const pets = resolveDataFormValues(
      buildFixture({
        petsAllowed: "Yes",
        "q47-animals": ["Pets < 20 Lbs.", "Pets 20 - 75 Lbs."],
      }),
    );
    assert.equal(pets.checkboxes.petsAllowed_Yes, true);
    assert.equal(pets.checkboxes["animals_Pets < 20 Lbs."], true);
    assert.equal(pets.checkboxes["animals_Pets 20 - 75 Lbs."], true);

    const noPets = resolveDataFormValues(buildFixture({ petsAllowed: "No" }));
    assert.equal(noPets.checkboxes.petsAllowed_No, true);
    assert.equal(noPets.checkboxes.animals_None, true);
  });

  it("maps tax parcel, PUD/PID, and expanded style options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        estimatedTaxes: "$3,450",
        waterShares: "2 shares",
        pud: "Yes",
        pid: "No",
        "q51-styleof51": "Patio Home",
      }),
    );
    assert.equal(result.text.estimatedTaxes, "3450");
    assert.equal(result.text.waterShares, "2 shares");
    assert.equal(result.checkboxes.pud_Yes, true);
    assert.equal(result.checkboxes.pid_No, true);
    assert.equal(result.checkboxes["style_Patio Home"], true);

    const noParcel = resolveDataFormValues(
      buildFixture({
        noAssignedParcelNumber: "Yes",
        taxParcelNumber: "should-clear",
      }),
    );
    assert.equal(noParcel.checkboxes.noAssignedParcelNumber, true);
    assert.equal(noParcel.text.taxParcelNumber, "");
  });

  it("maps lot dimensions and parking capacities", () => {
    const result = resolveDataFormValues(
      buildFixture({
        lotFrontage: "85",
        lotSide: "110",
        lotBack: "80",
        lotIrregularShape: "No",
        frontageFacing: "SW",
        parkingCapacity: "4",
        "q208-garagecapacity": "2",
        "q209-garagecapacity209": "1",
        rvParkingHeight: "13",
        rvParkingLength: "40",
        "q30-typea30": ["Garage", "RV Parking"],
      }),
    );
    assert.equal(result.text.lotFrontage, "85");
    assert.equal(result.text.lotSide, "110");
    assert.equal(result.text.lotBack, "80");
    assert.equal(result.checkboxes.lotIrregularShape_No, true);
    assert.equal(result.checkboxes.frontageFacing_SW, true);
    assert.equal(result.text.parkingCapacity, "4");
    assert.equal(result.text.garageCapacity, "2");
    assert.equal(result.text.rvParkingHeight, "13");
    assert.equal(result.text.rvParkingLength, "40");
  });

  it("maps ADU details when ADU is Yes", () => {
    const result = resolveDataFormValues(
      buildFixture({
        adu: "Yes",
        aduType: "Detached",
        aduSqft: "650",
        aduBeds: "1",
        aduBaths: "1",
        aduKitchen: "Yes",
        aduSeparateEntrance: "Yes",
        aduSeparateWaterMeter: "No",
        aduSeparateGasMeter: "No",
        aduSeparateElectricMeter: "Yes",
        aduCurrentlyRented: "Yes",
        aduMonthlyRent: "$1,250",
        aduRemarks: "Basement mother-in-law with private entrance.",
      }),
    );

    assert.equal(result.checkboxes.adu_Yes, true);
    assert.equal(result.checkboxes.aduType_Detached, true);
    assert.equal(result.text.aduSqft, "650");
    assert.equal(result.text.aduBeds, "1");
    assert.equal(result.text.aduBaths, "1");
    assert.equal(result.checkboxes.aduKitchen_Yes, true);
    assert.equal(result.checkboxes.aduSeparateEntrance_Yes, true);
    assert.equal(result.checkboxes.aduSeparateElectricMeter_Yes, true);
    assert.equal(result.checkboxes.aduCurrentlyRented_Yes, true);
    assert.equal(result.text.aduMonthlyRent, "1250");
    assert.equal(result.text.aduRemarks, "Basement mother-in-law with private entrance.");
  });
});
