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
    specialListingConditions: [],
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
        "master-y-n": ["Yes"],
        "full-baths": "2",
        "3-4-baths": "0",
        "1-2-baths": "1",
        family: ["Yes"],
        kitchen: ["Yes"],
        laundry: ["Yes"],
        fireplace: ["Yes"],
      },
      Basement: {
        "square-footage": "1000",
        bedrooms: "1",
        "full-baths": "0",
        "3-4-baths": "0",
        "1-2-baths": "0",
        den: ["Yes"],
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
    deckCount: "1",
    patioCount: "1",
    "q30-typea30": ["Garage", "Attached"],
    "q28-typea28": ["Concrete"],
    "q184-doesthe": "No",
    spaAvailable: "No",
    communityPool: "No",
    "q63-pooltype": [],
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
    showInstructions: [],
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

  it("emits per-level propInfo keys from the level matrix", () => {
    const result = resolveDataFormValues(buildFixture());

    assert.equal(result.text.propInfo_Level1_sqft, "1400");
    assert.equal(result.text.propInfo_Level1_beds, "3");
    assert.equal(result.text.propInfo_Level1_bathsFull, "2");
    assert.equal(result.text.propInfo_Level1_bathsHalf, "1");
    assert.equal(result.checkboxes.propInfo_Level1_primary, true);
    assert.equal(result.checkboxes.propInfo_Level1_family, true);
    assert.equal(result.checkboxes.propInfo_Level1_kitchen, true);
    assert.equal(result.checkboxes.propInfo_Level1_laundry, true);
    assert.equal(result.checkboxes.propInfo_Level1_fireplace, true);

    assert.equal(result.text.propInfo_Basement1_sqft, "1000");
    assert.equal(result.text.propInfo_Basement1_beds, "1");
    assert.equal(result.checkboxes.propInfo_Basement1_den, true);
    assert.equal(result.checkboxes.propInfo_Basement1_primary, undefined);
  });

  it("maps deck/patio counts and basement type aliases", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q26-typea26": ["Daylight", "None / Crawlspace / Slab", "See Remarks"],
        deckCount: "2",
        patioCount: "1",
      }),
    );

    assert.equal(result.text.deckCount, "2");
    assert.equal(result.text.patioCount, "1");
    assert.equal(result.checkboxes.basementType_Daylight, true);
    assert.equal(result.checkboxes["basementType_None/Crawl Space"], true);
    assert.equal(result.checkboxes["basementType_See Remarks"], true);
    assert.equal(result.checkboxes["basementType_None / Crawlspace / Slab"], undefined);
  });

  it("maps Second Story matrix row onto Level 2 keys", () => {
    const result = resolveDataFormValues(
      buildFixture({
        levelCount: "3",
        "q117-2level117": {
          "Main Level": {
            "square-footage": "1000",
            bedrooms: "2",
            "full-baths": "1",
            "3-4-baths": "0",
            "1-2-baths": "0",
          },
          Basement: {
            "square-footage": "800",
            bedrooms: "1",
            "full-baths": "1",
            "3-4-baths": "0",
            "1-2-baths": "0",
          },
          "Second Story": {
            "square-footage": "600",
            bedrooms: "2",
            "master-y-n": ["Yes"],
            "full-baths": "1",
            "3-4-baths": "0",
            "1-2-baths": "1",
            "formal-living": ["Yes"],
            breakfast: ["Yes"],
          },
        },
      }),
    );

    assert.equal(result.text.propInfo_Level2_sqft, "600");
    assert.equal(result.text.propInfo_Level2_beds, "2");
    assert.equal(result.text.propInfo_Level2_bathsHalf, "1");
    assert.equal(result.checkboxes.propInfo_Level2_primary, true);
    assert.equal(result.checkboxes.propInfo_Level2_formalLiving, true);
    assert.equal(result.checkboxes.propInfo_Level2_breakfast, true);
  });

  it("maps listing information and agent fields", () => {
    const result = resolveDataFormValues(
      buildFixture({
        specialOwnerType: ["LLC", "Trust"],
        listingEffectiveDate: "07/01/2026",
        listingExpirationDate: "12/31/2026",
        listingType: "Exclusive Agency (EAL)",
        specialListingConditions: ["Short Sale", "In Foreclosure", "Auction"],
        possession: "Upon Closing",
        contactType: "Owner",
        appointmentContact: "Jane Seller",
        contactPhone1: "8015551111",
        contactPhone2: "8015552222",
        listingAgentName: "Alex Agent",
        listingCoAgentName: "Casey Co",
        listingOfficeName: "Utah Digs Realty",
      }),
    );

    assert.equal(result.checkboxes["specialOwnerType_LLC"], true);
    assert.equal(result.checkboxes["specialOwnerType_Trust"], true);
    assert.equal(result.text.listingEffectiveDate, "07/01/2026");
    assert.equal(result.text.listingExpirationDate, "12/31/2026");
    assert.equal(result.checkboxes["listingType_Exclusive Agency (EAL)"], true);
    assert.equal(result.checkboxes["listingType_Exclusive Right to Sell (ERS)"], undefined);
    assert.equal(result.checkboxes["specialListingConditions_Short Sale"], true);
    assert.equal(result.checkboxes["specialListingConditions_In Foreclosure"], true);
    assert.equal(result.checkboxes.specialListingConditions_Auction, true);
    assert.equal(result.text.possession, "Upon Closing");
    assert.equal(result.checkboxes.contactType_Owner, true);
    assert.equal(result.text.appointmentContact, "Jane Seller");
    assert.equal(result.text.contactPhone1, "8015551111");
    assert.equal(result.text.contactPhone2, "8015552222");
    assert.equal(result.text.listingAgentName, "Alex Agent");
    assert.equal(result.text.listingCoAgentName, "Casey Co");
    assert.equal(result.text.listingOfficeName, "Utah Digs Realty");
  });

  it("defaults listing type to ERS and maps legacy shortSale radio", () => {
    const blank = resolveDataFormValues(buildFixture());
    assert.equal(blank.checkboxes["listingType_Exclusive Right to Sell (ERS)"], true);

    const legacy = resolveDataFormValues({
      ...buildFixture({ specialListingConditions: undefined }),
      shortSale: "Price Subject to 3rd Party Approval",
    } as FullMlsInputValues);
    assert.equal(
      legacy.checkboxes["specialListingConditions_Third Party Approval Required"],
      true,
    );
  });

  it("maps Accessibility, Air Conditioning, and Amenities Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q27-typea27": ["No-Step Entry", "Wheelchair Access", "Visitable"],
        "q31-airconditioning": ["Heat Pump", "Evaporative Cooler Roof"],
        "q42-amenities": ["Pickleball Court", "Ski-In/Ski-Out", "See Remarks"],
      }),
    );

    assert.equal(result.checkboxes["accessibility_No-Step Entry"], true);
    assert.equal(result.checkboxes["accessibility_Wheelchair Access"], true);
    assert.equal(result.checkboxes.accessibility_Visitable, true);
    assert.equal(result.checkboxes["airConditioning_Heat Pump"], true);
    assert.equal(result.checkboxes["airConditioning_Evap. Cooler: Roof"], true);
    assert.equal(result.checkboxes["amenities_Pickleball Court"], true);
    assert.equal(result.checkboxes["amenities_Ski-In/Ski-Out"], true);
    assert.equal(result.checkboxes["amenities_See Remarks"], true);
  });

  it("maps Driveway, Environmental Certs, and Exterior Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q28-typea28": ["Circular", "Heated", "See Remarks"],
        "q46-environmental-certs": ["LEED", "Built Green"],
        "q32-typea32": ["Composition", "Wood", "Straw Bale", "See Remarks"],
      }),
    );

    assert.equal(result.checkboxes.driveway_Circular, true);
    assert.equal(result.checkboxes.driveway_Heated, true);
    assert.equal(result.checkboxes["driveway_See Remarks"], true);
    assert.equal(result.checkboxes.environmentalCerts_Leed, true);
    assert.equal(result.checkboxes["environmentalCerts_Built Green"], true);
    assert.equal(result.checkboxes.exterior_Composition, true);
    assert.equal(result.checkboxes["exterior_Other Wood"], true);
    assert.equal(result.checkboxes["exterior_Straw Bale"], true);
    assert.equal(result.checkboxes["exterior_See Remarks"], true);
  });

  it("maps Exterior Special Features and Flooring Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q29-typea29": ["Atrium", "Patio Covered", "Walkout", "See Remarks"],
        "q33-flooring": ["Travertine", "Natural Stone", "LVP / Vinyl Plank", "See Remarks"],
      }),
    );

    assert.equal(result.checkboxes.exteriorFeatures_Atrium, true);
    assert.equal(result.checkboxes["exteriorFeatures_Patio: Covered"], true);
    assert.equal(result.checkboxes["exteriorFeatures_Walk Out"], true);
    assert.equal(result.checkboxes["exteriorFeatures_See Remarks"], true);
    assert.equal(result.checkboxes.flooring_Travertine, true);
    assert.equal(result.checkboxes["flooring_Natural Rock"], true);
    assert.equal(result.checkboxes["flooring_Vinyl (LVP)"], true);
    assert.equal(result.checkboxes["flooring_See Remarks"], true);
  });

  it("maps Garage/Parking and Heating Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q30-typea30": [
          "Built-in",
          "Electrical Vehicle Charging Station",
          "Parking: Covered",
          "See Remarks",
        ],
        "q96-hvac96": [">= 95% efficiency", "Gas: Radiant", "Radiant: In Floor", "See Remarks"],
      }),
    );

    assert.equal(result.checkboxes["garageParking_Built-in"], true);
    assert.equal(result.checkboxes["garageParking_Electrical Vehicle Charging Station"], true);
    assert.equal(result.checkboxes["garageParking_Parking: Covered"], true);
    assert.equal(result.checkboxes["garageParking_See Remarks"], true);
    assert.equal(result.checkboxes["heating_>= 95% efficiency"], true);
    assert.equal(result.checkboxes["heating_Gas: Radiant"], true);
    assert.equal(result.checkboxes["heating_Radiant: In Floor"], true);
    assert.equal(result.checkboxes["heating_See Remarks"], true);

    const legacy = resolveDataFormValues(
      buildFixture({
        "q30-typea30": ["Garage", "Carport"],
        "q96-hvac96": ["Gas", "Furnace / Forced Air", "Baseboard", "Solar"],
      }),
    );
    assert.equal(legacy.checkboxes.garageParking_Attached, true);
    assert.equal(legacy.checkboxes["garageParking_Parking: Covered"], true);
    assert.equal(legacy.checkboxes["heating_Gas: Central"], true);
    assert.equal(legacy.checkboxes["heating_Forced Air"], true);
    assert.equal(legacy.checkboxes["heating_Electric: Baseboard"], true);
    assert.equal(legacy.checkboxes["heating_Active Solar"], true);
  });

  it("maps Inclusions / Exclusions include and exclude columns", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q19-typea19": {
          "Alarm System": { include: ["Yes"] },
          Dryer: { exclude: ["Yes"] },
          Humidifier: { include: ["Yes"] },
          "Water Softener: Rent": { exclude: ["Yes"] },
          "See Remarks": { include: ["Yes"] },
        },
      }),
    );

    assert.equal(result.checkboxes["inclusions_Alarm System"], true);
    assert.equal(result.checkboxes.exclusions_Dryer, true);
    assert.equal(result.checkboxes.inclusions_Dryer, undefined);
    assert.equal(result.checkboxes.inclusions_Humidifer, true);
    assert.equal(result.checkboxes["exclusions_Water Softener: Rent"], true);
    assert.equal(result.checkboxes["inclusions_See Remarks"], true);

    const legacyRaw = resolveDataFormValues({
      ...buildFixture(),
      "q19-typea19": ["Refrigerator", "Gym Equipment", "Water Softener"],
    } as unknown as FullMlsInputValues);
    assert.equal(legacyRaw.checkboxes.inclusions_Refrigerator, true);
    assert.equal(legacyRaw.checkboxes["inclusions_Play Gym"], true);
    assert.equal(legacyRaw.checkboxes["inclusions_Water Softener: Own"], true);
  });

  it("maps Interior Special Features Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q34-typea34": [
          "Closet: Walk-in",
          "Kitchen: Updated",
          "Range / Oven, Free Stdng.",
          "See Remarks",
        ],
      }),
    );

    assert.equal(result.checkboxes["interiorFeatures_Closet: Walk-in"], true);
    assert.equal(result.checkboxes["interiorFeatures_Kitchen: Updated"], true);
    assert.equal(result.checkboxes["interiorFeatures_Range / Oven, Free Stdng."], true);
    assert.equal(result.checkboxes["interiorFeatures_See Remarks"], true);

    const legacy = resolveDataFormValues(
      buildFixture({
        "q34-typea34": ["Wet Bar", "Master Bath", "Gas Range", "Mother In Law Apartment"],
      }),
    );
    assert.equal(legacy.checkboxes["interiorFeatures_Bar: Wet"], true);
    assert.equal(legacy.checkboxes["interiorFeatures_Bath: Primary"], true);
    assert.equal(legacy.checkboxes["interiorFeatures_Range, Gas"], true);
    assert.equal(legacy.checkboxes["interiorFeatures_Mother-in-law Apt."], true);
  });

  it("maps Landscaping and Lot Facts Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q36-typea36": ["Fruit Trees", "Xeriscaped", "See Remarks"],
        "q43-lot-facts": [
          "Drip Irrigation: Auto-full",
          "View: Red Rock",
          "Sprinkler: Manual-part",
          "See Remarks",
        ],
      }),
    );

    assert.equal(result.checkboxes["landscaping_Fruit Trees"], true);
    assert.equal(result.checkboxes.landscaping_Xeriscaped, true);
    assert.equal(result.checkboxes["landscaping_See Remarks"], true);
    assert.equal(result.checkboxes["lotFacts_Drip Irrigation: Auto-full"], true);
    assert.equal(result.checkboxes["lotFacts_View: Red Rock"], true);
    assert.equal(result.checkboxes["lotFacts_Sprinkler: Manual-part"], true);
    assert.equal(result.checkboxes["lotFacts_See Remarks"], true);

    const legacy = resolveDataFormValues(
      buildFixture({
        "q36-typea36": ["Full Landscaping", "Sprinkler System", "Corner Lot"],
        "q43-lot-facts": ["Terrain, Flat", "Road, Paved", "View, Mountain"],
      }),
    );
    assert.equal(legacy.checkboxes["landscaping_Landscaping: Full"], true);
    assert.equal(legacy.checkboxes["lotFacts_Sprinkler: Auto-full"], true);
    assert.equal(legacy.checkboxes["lotFacts_Corner Lot"], true);
    assert.equal(legacy.checkboxes["lotFacts_Terrain: Flat"], true);
    assert.equal(legacy.checkboxes["lotFacts_Road: Paved"], true);
    assert.equal(legacy.checkboxes["lotFacts_View: Mountain"], true);
  });

  it("maps Pool, Spa, Community Pool, Roof, and Show Instructions", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q184-doesthe": "Yes",
        "q63-pooltype": ["In Ground", "Concrete", "Powered Cover", "With Spa/Hot Tub"],
        spaAvailable: "Yes",
        communityPool: "No",
        "q37-typea37": ["Bitumen", "Wood Shake", "See Remarks"],
        showInstructions: ["Agent Has Key", "Key Box: Electronic", "Vacant"],
      }),
    );

    assert.equal(result.checkboxes.poolAvailable_Yes, true);
    assert.equal(result.checkboxes["poolFeatures_In Ground"], true);
    assert.equal(result.checkboxes["poolFeatures_Concrete/Gunite"], true);
    assert.equal(result.checkboxes["poolFeatures_Electronic Cover"], true);
    assert.equal(result.checkboxes["poolFeatures_With Spa"], true);
    assert.equal(result.checkboxes.spaAvailable_Yes, true);
    assert.equal(result.checkboxes.communityPool_No, true);
    assert.equal(result.checkboxes.roof_Bitumen, true);
    assert.equal(result.checkboxes["roof_Wood Shake Shingles"], true);
    assert.equal(result.checkboxes["roof_See Remarks"], true);
    assert.equal(result.checkboxes["showInstructions_Agent Has Key"], true);
    assert.equal(result.checkboxes["showInstructions_Key Box: Electronic"], true);
    assert.equal(result.checkboxes.showInstructions_Vacant, true);
    // Explicit showInstructions replaces occupancy fallback
    assert.equal(result.checkboxes["showInstructions_Call Owner / Appt"], undefined);
  });

  it("maps Storage, Telecommunications, and Terms Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q39-typea39": ["Basement", "Shed", "See Remarks"],
        "q45-telecommunications": ["Ethernet, Wired", "T-1 Line", "See Remarks"],
        "q40-typea40": [
          "Assumption: Qualify",
          "Cryptocurrency",
          "FHA 203(k) - Rehabilitation",
          "USDA Rural Development",
        ],
      }),
    );

    assert.equal(result.checkboxes.storage_Basement, true);
    assert.equal(result.checkboxes.storage_Shed, true);
    assert.equal(result.checkboxes["storage_See Remarks"], true);
    assert.equal(result.checkboxes["telecommunications_Ethernet, Wired"], true);
    assert.equal(result.checkboxes["telecommunications_T-1 Line"], true);
    assert.equal(result.checkboxes["telecommunications_See Remarks"], true);
    assert.equal(result.checkboxes["terms_Assumption: Qualify"], true);
    assert.equal(result.checkboxes.terms_Cryptocurrency, true);
    assert.equal(result.checkboxes["terms_FHA 203(k) - Rehabilitation"], true);
    assert.equal(result.checkboxes["terms_USDA Rural Development"], true);

    const legacy = resolveDataFormValues(
      buildFixture({
        "q45-telecommunications": ["Fiber Optics", "Wireless Broadband"],
        "q40-typea40": ["Conventional Loan", "VA / FHA Loan", "Lease Option"],
      }),
    );
    assert.equal(legacy.checkboxes.telecommunications_Fiber, true);
    assert.equal(legacy.checkboxes["telecommunications_See Remarks"], true);
    assert.equal(legacy.checkboxes.terms_Conventional, true);
    assert.equal(legacy.checkboxes.terms_VA, true);
    assert.equal(legacy.checkboxes.terms_FHA, true);
    assert.equal(legacy.checkboxes["terms_Lease Option Monthly"], true);
  });

  it("maps Utilities, Water, Window Coverings, and Zoning Data Form options", () => {
    const result = resolveDataFormValues(
      buildFixture({
        "q35-connectedutilities": [
          "Gas: Available",
          "Power: Connected",
          "Sewer: Septic Tank",
          "Water: Connected",
          "See Remarks",
        ],
        "q44-water": ["Irrigation: Pressure", "Rights: Owned", "Well"],
        "q41-window-coverings": ["Plantation Shutters", "Part", "See Remarks"],
        "q38-zoning": ["Multi-Family", "Short Term Rental Allowed", "See Remarks"],
      }),
    );

    assert.equal(result.checkboxes["utilities_Gas: Available"], true);
    assert.equal(result.checkboxes["utilities_Power: Connected"], true);
    assert.equal(result.checkboxes["utilities_Sewer: Septic Tank"], true);
    assert.equal(result.checkboxes["utilities_Water: Connected"], true);
    assert.equal(result.checkboxes["utilities_See Remarks"], true);
    assert.equal(result.checkboxes["water_Irrigation: Pressure"], true);
    assert.equal(result.checkboxes["water_Rights: Owned"], true);
    assert.equal(result.checkboxes.water_Well, true);
    assert.equal(result.checkboxes["windowCoverings_Plantation Shutters"], true);
    assert.equal(result.checkboxes.windowCoverings_Part, true);
    assert.equal(result.checkboxes["windowCoverings_See Remarks"], true);
    assert.equal(result.checkboxes["zoning_Multi-Family"], true);
    assert.equal(result.checkboxes["zoning_Short Term Rental Allowed"], true);
    assert.equal(result.checkboxes["zoning_See Remarks"], true);

    const legacy = resolveDataFormValues(
      buildFixture({
        "q35-connectedutilities": ["Natural Gas", "Septic", "Culinary Water Only", "Well"],
        "q44-water": ["Irrigation, Pressure", "Rights, Rented"],
        "q41-window-coverings": ["Partial"],
        "q38-zoning": ["Residential", "Horse Property"],
      }),
    );
    assert.equal(legacy.checkboxes["utilities_Gas: Connected"], true);
    assert.equal(legacy.checkboxes["utilities_Sewer: Septic Tank"], true);
    assert.equal(legacy.checkboxes.water_Culinary, true);
    assert.equal(legacy.checkboxes.water_Well, true);
    assert.equal(legacy.checkboxes["water_Irrigation: Pressure"], true);
    assert.equal(legacy.checkboxes["water_Rights: Rented"], true);
    assert.equal(legacy.checkboxes.windowCoverings_Part, true);
    assert.equal(legacy.checkboxes["zoning_Single-Family"], true);
    assert.equal(legacy.checkboxes["zoning_See Remarks"], true);
  });
});
