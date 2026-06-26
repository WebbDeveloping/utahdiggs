import { validateFullMlsInput } from "../../src/lib/mls-input/validation";
import type { FullMlsInputValues } from "../../src/lib/mls-input/validation";
import type { SeedPhoto } from "./copy-seed-photos";

export type MlsTestListingConfig = {
  portalSlug: string;
  mlsNumber: string;
  portfolioGroup: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  subdivision: string;
  listingOffice: string;
  listDate: Date;
  imageNumbers: number[];
  primaryOwnerEmail: string;
  overrides: Partial<Record<string, unknown>>;
};

function schools(names: {
  district: string;
  elementary: string;
  juniorHigh: string;
  high: string;
}) {
  return {
    "School District": { name: names.district },
    "Elementary School": { name: names.elementary },
    "Junior High/Middle School": { name: names.juniorHigh },
    "High School": { name: names.high },
  };
}

function levelRow(
  sqft: string,
  bedrooms: string,
  fullBaths: string,
  halfBaths = "0",
  threeQuarterBaths = "0",
) {
  return {
    "square-footage": sqft,
    bedrooms,
    "full-baths": fullBaths,
    "3-4-baths": threeQuarterBaths,
    "1-2-baths": halfBaths,
    "master-y-n": bedrooms !== "0" ? ["Y"] : [],
    "living-fam-rm": ["Living Room"],
  };
}

function buildBaseMlsValues(
  signatureUrl: string,
  photos: SeedPhoto[],
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    ownerCount: "One",
    primaryOwnerName: { first: "Test", last: "Seller" },
    primaryOwnerPhone: "8015551234",
    primaryOwnerEmail: "seller@test.com",
    listingAddress: {
      street: "123 Test Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    listingCounty: "Salt Lake",
    listingQuadrant: "NE",
    nonStandardAddress: "No",
    ownerAddressSameAsListing: "Yes",
    listingPrice: "525000",
    shortSale: "Not Short Sale",
    schools: schools({
      district: "Granite School District",
      elementary: "Whittier Elementary",
      juniorHigh: "Bryant Middle School",
      high: "East High School",
    }),
    hoa: "No",
    solar: "No",
    "q11-propertytype": "Single Family",
    constructionStatus: "Built/Standing",
    "q51-styleof51": "2-Story",
    yearBuilt: "1998",
    taxParcelNumber: "12-34-56-789",
    lotSize: "0.18",
    livingSqft: "2400",
    levelCount: "2",
    "q26-typea26": ["Full"],
    basementFinished: "Partial",
    "q117-2level117": {
      "Main Level": levelRow("1400", "3", "2", "1"),
      Basement: levelRow("1000", "1", "0", "0"),
    },
    "q33-flooring": ["Hardwood", "Tile", "Carpet"],
    "q34-typea34": ["Vaulted Ceilings", "Gas Range"],
    "q27-typea27": ["None"],
    "q41-window-coverings": ["Blinds", "Draperies"],
    "q42-amenities": ["None"],
    "q31-airconditioning": ["Central Air; Gas"],
    "q96-hvac96": ["Gas", "Furnace / Forced Air"],
    "q32-typea32": ["Frame", "Stucco"],
    "q29-typea29": ["Deck: Covered", "Patio Covered"],
    "q30-typea30": ["Garage", "Attached"],
    "q28-typea28": ["Concrete"],
    "q184-doesthe": "No",
    "q37-typea37": ["Asphalt Shingles"],
    "q36-typea36": ["Full Landscaping", "Sprinkler System"],
    "q43-lot-facts": ["Curb & Gutter", "Sidewalks", "Terrain, Flat"],
    "q47-animals": "None",
    "q39-typea39": ["Garage", "Basement"],
    "q35-connectedutilities": ["Natural Gas", "Power", "Sewer"],
    "q44-water": ["Culinary"],
    "q45-telecommunications": ["Fiber Optics", "Broadband Cable"],
    "q38-zoning": ["Residential"],
    "q40-typea40": ["Cash", "Conventional Loan"],
    "q191-propertyoccupancy": "Owner Occupied",
    "q97-publicremarks":
      "Updated home with open living spaces, remodeled kitchen, and easy access to city amenities.",
    "field-44": photos,
    "q20-signature": signatureUrl,
    ...overrides,
  };
}

export const MLS_TEST_LISTING_CONFIGS: MlsTestListingConfig[] = [
  {
    portalSlug: "test-home-3",
    mlsNumber: "TEST-003",
    portfolioGroup: "test-portfolio",
    latitude: 40.5649,
    longitude: -111.8389,
    neighborhood: "Sandy",
    subdivision: "Bell Canyon",
    listingOffice: "Glide RE",
    listDate: new Date("2025-12-01"),
    imageNumbers: [1, 2, 3, 4, 5],
    primaryOwnerEmail: "seller@test.com",
    overrides: {
      listingAddress: {
        street: "789 Bell Canyon Rd",
        city: "Sandy",
        state: "UT",
        zip: "84070",
      },
      listingQuadrant: "SE",
      listingPrice: "589000",
      livingSqft: "2650",
      yearBuilt: "2001",
      lotSize: "0.22",
      taxParcelNumber: "22-11-33-445",
      "q51-styleof51": "2-Story",
      schools: schools({
        district: "Canyons School District",
        elementary: "Bell View Elementary",
        juniorHigh: "Albion Middle School",
        high: "Jordan High School",
      }),
      hoa: "No",
      solar: "No",
      "q184-doesthe": "No",
      "q191-propertyoccupancy": "Owner Occupied",
      "q97-publicremarks":
        "Bright Sandy home on a quiet street with updated finishes, a finished basement, and mountain views.",
    },
  },
  {
    portalSlug: "test-home-4",
    mlsNumber: "TEST-004",
    portfolioGroup: "test-portfolio",
    latitude: 40.7189,
    longitude: -111.8553,
    neighborhood: "Sugar House",
    subdivision: "Forest Dale",
    listingOffice: "Glide RE",
    listDate: new Date("2025-11-15"),
    imageNumbers: [6, 7, 8, 9, 10],
    primaryOwnerEmail: "seller@test.com",
    overrides: {
      ownerCount: "Two",
      secondaryOwnerName: { first: "Test", last: "Co-Seller" },
      secondaryOwnerPhone: "8015555678",
      secondaryOwnerEmail: "coseller@test.com",
      listingAddress: {
        street: "2100 S Highland Dr",
        city: "Salt Lake City",
        state: "UT",
        zip: "84106",
      },
      listingQuadrant: "SE",
      listingPrice: "725000",
      livingSqft: "3100",
      yearBuilt: "2005",
      lotSize: "0.24",
      taxParcelNumber: "15-08-77-112",
      "q11-propertytype": "Single Family",
      "q51-styleof51": "Rambler / Ranch Style",
      levelCount: "3",
      "q117-2level117": {
        "Main Level": levelRow("1800", "3", "2", "0"),
        Basement: levelRow("900", "1", "1", "0"),
        "Second Story": levelRow("400", "1", "1", "0"),
      },
      schools: schools({
        district: "Salt Lake City School District",
        elementary: "Bonnie Brae Elementary",
        juniorHigh: "Clayton Middle School",
        high: "Highland High School",
      }),
      hoa: "Yes",
      hoaFeeMonth: "275",
      hoaContact: "Forest Dale HOA",
      hoaContactPhone: "8015559000",
      hoaRemarks: "Covers landscaping, snow removal, and community pool access.",
      solar: "No",
      "q184-doesthe": "Yes",
      "q63-pooltype": ["In Ground", "Heated", "Fenced"],
      "q208-garagecapacity": "2",
      "q42-amenities": ["Swimming Pool", "Clubhouse"],
      "q191-propertyoccupancy": "Owner Occupied",
      "q192-howmany": "Two",
      "q194-ownershowing": { first: "Test", last: "Seller" },
      "q195-phonenumber": "8015551234",
      "q196-email": "seller@test.com",
      "q197-ownershowing197": { first: "Test", last: "Co-Seller" },
      "q198-ownershowing198": "8015555678",
      "q199-ownershowing199": "coseller@test.com",
      "q23-signature23": "", // set at build time
      "q97-publicremarks":
        "Spacious Sugar House rambler with finished basement, private pool, and mature landscaping in Forest Dale.",
    },
  },
  {
    portalSlug: "test-home-5",
    mlsNumber: "TEST-005",
    portfolioGroup: "test-portfolio",
    latitude: 40.5246,
    longitude: -111.8638,
    neighborhood: "Draper",
    subdivision: "SunCrest",
    listingOffice: "Glide RE",
    listDate: new Date("2025-10-20"),
    imageNumbers: [11, 12, 13, 14, 15],
    primaryOwnerEmail: "seller@test.com",
    overrides: {
      listingAddress: {
        street: "14200 S Canyon Vista Ln",
        city: "Draper",
        state: "UT",
        zip: "84020",
      },
      listingQuadrant: "SE",
      listingPrice: "495000",
      livingSqft: "1850",
      yearBuilt: "2012",
      lotSize: "0.08",
      taxParcelNumber: "44-19-02-331",
      "q11-propertytype": "Townhouse",
      "q51-styleof51": "Townhouse",
      levelCount: "2",
      "q117-2level117": {
        "Main Level": levelRow("950", "2", "1", "1"),
        "Second Story": levelRow("900", "2", "1", "0"),
      },
      schools: schools({
        district: "Canyons School District",
        elementary: "Oak Hollow Elementary",
        juniorHigh: "Draper Park Middle School",
        high: "Corner Canyon High School",
      }),
      hoa: "Yes",
      hoaFeeMonth: "185",
      hoaContact: "SunCrest Townhome Association",
      hoaContactPhone: "8015558800",
      solar: "Yes",
      "q184-doesthe": "No",
      "q42-amenities": ["Gated Community", "Clubhouse"],
      "q191-propertyoccupancy": "Tenant Occupied",
      "q193-howmany193": "One",
      "q200-tenantshowing": { first: "Jordan", last: "Tenant" },
      "q201-ownershowing201": "8015551234",
      "q202-tenantshowing202": "tenant@example.com",
      "q100-showinginstructions":
        "Please allow 24 hours notice. Tenant works from home on Fridays.",
      "q97-publicremarks":
        "Modern SunCrest townhouse with open main level, two primary suites upstairs, and valley views.",
    },
  },
];

export function buildMlsTestListingValues(
  config: MlsTestListingConfig,
  photos: SeedPhoto[],
  signatureUrl: string,
): Record<string, unknown> {
  const overrides = { ...config.overrides };
  if (overrides.ownerCount === "Two") {
    overrides["q23-signature23"] = signatureUrl;
  }
  return buildBaseMlsValues(signatureUrl, photos, overrides);
}

export function validateMlsTestListings(
  listings: Array<{ portalSlug: string; values: Record<string, unknown> }>,
): FullMlsInputValues[] {
  const validated: FullMlsInputValues[] = [];

  for (const { portalSlug, values } of listings) {
    const result = validateFullMlsInput(values);
    if (!result.success) {
      const fields = Object.entries(result.fieldErrors)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
      throw new Error(`MLS seed validation failed for ${portalSlug}: ${fields}`);
    }
    validated.push(result.data);
  }

  return validated;
}
