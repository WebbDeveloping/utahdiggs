import type { FullMlsInputValues } from "@/lib/mls-input/validation";

export type DataFormResolvedValues = {
  text: Record<string, string>;
  checkboxes: Record<string, boolean>;
  /** Image field name → PNG/JPG URL (fetched at fill time). */
  images: Record<string, string>;
};

type AddressValue = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type FullnameValue = {
  first?: string;
  last?: string;
};

function formatName(name?: FullnameValue): string {
  if (!name) return "";
  return [name.first, name.last].filter(Boolean).join(" ").trim();
}

function schoolName(
  schools: FullMlsInputValues["schools"],
  key: string,
): string {
  const entry = schools?.[key];
  if (!entry || typeof entry !== "object") return "";
  const name = (entry as { name?: string }).name;
  return typeof name === "string" ? name.trim() : "";
}

function setCheckbox(
  checkboxes: Record<string, boolean>,
  key: string,
  checked: boolean,
): void {
  if (checked) {
    checkboxes[key] = true;
  }
}

function markSelected(
  checkboxes: Record<string, boolean>,
  prefix: string,
  selected: string[] | undefined,
  aliases: Record<string, string> = {},
): void {
  if (!selected) return;
  for (const raw of selected) {
    const label = raw.trim();
    if (!label || label === "None") continue;
    const mapped = aliases[label] ?? label;
    setCheckbox(checkboxes, `${prefix}_${mapped}`, true);
  }
}

const STYLE_ALIASES: Record<string, string> = {
  "2-Story": "2-Story",
  "A-Frame": "A-Frame",
  Basement: "Basement",
  "Bungalow/Cottage": "Bungalow/Cottage",
  "Bungalow / Cottage": "Bungalow/Cottage",
  Cabin: "Cabin",
  "Condo, High Rise": "Condo, High Rise",
  "Condo, Main Level": "Condo, Main Level",
  "Condo, Middle Level": "Condo, Middle Level",
  "Condo, Studio": "Condo, Studio",
  "Condo, Top Level": "Condo, Top Level",
  Manufactured: "Manufactured",
  "Mid-Century Modern": "Mid-Century Modern",
  Mobile: "Mobile",
  Modern: "Modern",
  Modular: "Modular",
  "Patio Home": "Patio Home",
  "Rambler/Ranch": "Rambler/Ranch",
  "Rambler / Ranch Style": "Rambler/Ranch",
  Southwest: "Southwest",
  "Split-Entry/Bi-Level": "Split-Entry/Bi-Level",
  "Split Entry / Bi-Level": "Split-Entry/Bi-Level",
  "Townhouse, Row-End": "Townhouse, Row-End",
  "Townhouse, Row End": "Townhouse, Row-End",
  "Townhouse, Row-Mid": "Townhouse, Row-Mid",
  Townhouse: "Townhouse, Row-Mid",
  "Tri/Multi-Level": "Tri/Multi-Level",
  "Tri / Multi-Level": "Tri/Multi-Level",
  Tudor: "Tudor",
  Victorian: "Victorian",
  "See Remarks": "See Remarks",
  Other: "See Remarks",
};

const PROPERTY_TYPE_ALIASES: Record<string, string> = {
  "Single Family": "Single Family",
  Condominium: "Condominium",
  "Mobile (w/o land)": "Mobile (w/o land)",
  Recreational: "Recreational",
  Townhouse: "Townhouse",
  Twin: "Twin",
};

const CONSTRUCTION_ALIASES: Record<string, string> = {
  "Built/Standing": "Built /Standing",
  "Under Construction": "Under Construction",
  "To Be Built": "To Be Built",
};

const SOLAR_OWNERSHIP_ALIASES: Record<string, string> = {
  Owned: "Solar Owned",
  Leased: "Solar Leased",
  Financed: "Solar Financed",
  "Power Purchase Agreement (PPA)": "Solar Leased",
};

const SHORT_SALE_ALIASES: Record<string, string> = {
  "Not Short Sale": "",
  "Price Subject to 3rd Party Approval": "Third Party Approval Required",
  "Price Previously Approved by 3rd Party": "Price Was Approved by Third Party",
  "Offer Under 3rd Party Review": "Offer Under Third Party Review",
};

const LOT_FACT_ALIASES: Record<string, string> = {
  "Terrain, Flat": "Terrain: Flat",
  "Terrain, Grad Slope": "Terrain: Grad Slope",
  "Terrain, Hilly": "Terrain: Hilly",
  "Terrain, Mountain": "Terrain: Mountain",
  "Terrain, Steep Slope": "Terrain: Steep Slope",
};

const LANDSCAPING_ALIASES: Record<string, string> = {
  "Full Landscaping": "Landscaping: Full",
  "Part Landscaping": "Landscaping: Part",
  "Sprinkler System": "Sprinkler: Auto-full",
};

const DRIVEWAY_ALIASES: Record<string, string> = {};

const EXTERIOR_FEATURE_ALIASES: Record<string, string> = {
  "Patio Covered": "Patio: Covered",
  "Patio Open": "Patio: Open",
};

const PARKING_ALIASES: Record<string, string> = {
  Garage: "Attached",
};

const HEATING_ALIASES: Record<string, string> = {
  Gas: "Gas: Central",
  "Furnace / Forced Air": "Forced Air",
};

const UTILITIES_ALIASES: Record<string, string> = {
  "Natural Gas": "Gas: Connected",
  Power: "Power: Connected",
  Sewer: "Sewer: Connected",
};

const TERMS_ALIASES: Record<string, string> = {
  "Conventional Loan": "Conventional",
  Cash: "Cash",
  FHA: "FHA",
  VA: "VA",
};

const TELECOM_ALIASES: Record<string, string> = {
  "Fiber Optics": "Fiber",
  "Broadband Cable": "Broadband Cable",
  DSL: "DSL",
};

const ZONING_ALIASES: Record<string, string> = {
  Residential: "Single-Family",
  "Single-Family": "Single-Family",
  "Multi Family": "Multi-Family",
  "Multi-Family": "Multi-Family",
  "Short Term Rental Allowed": "Short Term Rental Allowed",
  Commercial: "Commercial",
  Agricultural: "Agricultural",
  Industrial: "Industrial",
};

function sumLevelMatrix(values: FullMlsInputValues): {
  beds: string;
  bathsFull: string;
  bathsThreeQuarter: string;
  bathsHalf: string;
  totalSqft: string;
} {
  const matrix = values["q117-2level117"] as
    | Record<string, Record<string, string | string[]>>
    | undefined;
  if (!matrix) {
    return { beds: "", bathsFull: "", bathsThreeQuarter: "", bathsHalf: "", totalSqft: "" };
  }

  let totalBeds = 0;
  let totalFull = 0;
  let totalThreeQuarter = 0;
  let totalHalf = 0;
  let totalSqft = 0;

  for (const row of Object.values(matrix)) {
    const beds = parseInt(String(row.bedrooms ?? "0"), 10);
    if (!Number.isNaN(beds)) totalBeds += beds;
    const full = parseInt(String(row["full-baths"] ?? "0"), 10);
    if (!Number.isNaN(full)) totalFull += full;
    const threeQ = parseInt(String(row["3-4-baths"] ?? "0"), 10);
    if (!Number.isNaN(threeQ)) totalThreeQuarter += threeQ;
    const half = parseInt(String(row["1-2-baths"] ?? "0"), 10);
    if (!Number.isNaN(half)) totalHalf += half;
    const sqft = parseInt(String(row["square-footage"] ?? "0"), 10);
    if (!Number.isNaN(sqft)) totalSqft += sqft;
  }

  return {
    beds: totalBeds > 0 ? String(totalBeds) : "",
    bathsFull: totalFull > 0 ? String(totalFull) : "",
    bathsThreeQuarter: totalThreeQuarter > 0 ? String(totalThreeQuarter) : "",
    bathsHalf: totalHalf > 0 ? String(totalHalf) : "",
    totalSqft: totalSqft > 0 ? String(totalSqft) : "",
  };
}

function parseStreetParts(street: string): {
  houseNumber: string;
  streetName: string;
} {
  const trimmed = street.trim();
  const match = trimmed.match(/^(\d+[A-Za-z]?)\s+(.+)$/);
  if (!match) {
    return { houseNumber: "", streetName: trimmed };
  }
  return { houseNumber: match[1] ?? "", streetName: match[2] ?? "" };
}

function todayMdY(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}/${day}/${now.getFullYear()}`;
}

/**
 * Maps MLS intake answers onto Data Form — Residential field-map keys.
 * Checkbox keys use `{section}_{Option Label}` matching the URE PDF option text.
 */
export function resolveDataFormValues(
  values: FullMlsInputValues,
  options?: { signedDate?: string },
): DataFormResolvedValues {
  const text: Record<string, string> = {};
  const checkboxes: Record<string, boolean> = {};
  const images: Record<string, string> = {};

  const address = values.listingAddress as AddressValue | undefined;
  const { houseNumber, streetName } = parseStreetParts(address?.street ?? "");
  const levels = sumLevelMatrix(values);
  const signedDate = options?.signedDate ?? todayMdY();

  text.houseNumber = houseNumber;
  text.streetName = streetName;
  text.city = address?.city?.trim() ?? "";
  text.county = String(values.listingCounty ?? "").trim();
  text.state = (address?.state?.trim() || "UT").toUpperCase();
  text.zip = address?.zip?.trim() ?? "";
  text.coordNorthSouth = String(values.coordNorthSouth ?? "").trim();
  text.coordEastWest = String(values.coordEastWest ?? "").trim();
  text.projectSubdivision = String(values.projectSubdivision ?? "").trim();
  text.listPrice = String(values.listingPrice ?? "").replace(/[^0-9.]/g, "");
  text.schoolDistrict = schoolName(values.schools, "School District");
  text.elementarySchool = schoolName(values.schools, "Elementary School");
  text.juniorHighSchool = schoolName(values.schools, "Junior High/Middle School");
  text.highSchool = schoolName(values.schools, "High School");
  text.otherSchool = String(values.otherSchool ?? "").trim();
  text.yearBuilt = String(values.yearBuilt ?? "").trim();
  text.effectiveYearBuilt = String(values.effectiveYearBuilt ?? "").trim();
  text.taxParcelNumber =
    values.noAssignedParcelNumber === "Yes"
      ? ""
      : String(values.taxParcelNumber ?? "").trim();
  text.estimatedTaxes = String(values.estimatedTaxes ?? "").replace(/[^0-9.]/g, "");
  text.waterShares = String(values.waterShares ?? "").trim();
  text.acres = String(values.lotSize ?? "").trim();
  text.lotFrontage = String(values.lotFrontage ?? "").trim();
  text.lotSide = String(values.lotSide ?? "").trim();
  text.lotBack = String(values.lotBack ?? "").trim();
  text.approxSqFt = String(values.livingSqft ?? levels.totalSqft).trim();
  text.beds = levels.beds;
  text.bathsFull = levels.bathsFull;
  text.bathsThreeQuarter = levels.bathsThreeQuarter;
  text.bathsHalf = levels.bathsHalf;
  text.style = STYLE_ALIASES[String(values["q51-styleof51"] ?? "")] ?? String(values["q51-styleof51"] ?? "");
  text.ownerName = formatName(values.primaryOwnerName as FullnameValue);
  text.ownerPhone = String(values.primaryOwnerPhone ?? "").trim();
  text.ownerEmail = String(values.primaryOwnerEmail ?? "").trim();
  text.hoaFee = values.hoa === "Yes" ? String(values.hoaFeeMonth ?? "").trim() : "";
  text.hoaChangeFeeAmount =
    values.hoa === "Yes" &&
    (values.hoaChangeFeeType === "Percentage of sales price" ||
      values.hoaChangeFeeType === "Dollar amount")
      ? String(values.hoaChangeFeeAmount ?? "").trim()
      : "";
  text.hoaContact = values.hoa === "Yes" ? String(values.hoaContact ?? "").trim() : "";
  text.hoaContactPhone =
    values.hoa === "Yes" ? String(values.hoaContactPhone ?? "").trim() : "";
  text.hoaRemarks = values.hoa === "Yes" ? String(values.hoaRemarks ?? "").trim() : "";
  text.garageCapacity = String(values["q208-garagecapacity"] ?? "").trim();
  text.carportCapacity = String(values["q209-garagecapacity209"] ?? "").trim();
  text.parkingCapacity = String(values.parkingCapacity ?? "").trim();
  text.rvParkingHeight = String(values.rvParkingHeight ?? "").trim();
  text.rvParkingLength = String(values.rvParkingLength ?? "").trim();
  text.publicRemarks = String(values["q97-publicremarks"] ?? "").trim();
  text.exclusionsRemarks = String(values.exclusionsRemarks ?? "").trim();
  text.directions =
    values.nonStandardAddress === "Yes"
      ? String(values.directionsRemarks ?? "").trim()
      : "";
  text.showingInstructions = String(values["q100-showinginstructions"] ?? "").trim();
  text.solarInstallDate = values.solar === "Yes" ? String(values.solarYearInstalled ?? "").trim() : "";
  text.solarLeasingCompany =
    values.solar === "Yes" &&
    (values.solarOwnership === "Leased" ||
      values.solarOwnership === "Power Purchase Agreement (PPA)")
      ? String(values.solarCompanyName ?? "").trim()
      : "";
  text.solarFinanceCompany =
    values.solar === "Yes" && values.solarOwnership === "Financed"
      ? String(values.solarFinanceCompany ?? "").trim()
      : "";
  text.signedDate = signedDate;

  const zoningSelected = values["q38-zoning"] as string[] | undefined;
  if (zoningSelected?.length) {
    text.zoningText = zoningSelected
      .map((z) => ZONING_ALIASES[z] ?? z)
      .filter(Boolean)
      .join(", ");
  }

  for (const page of [0, 1, 2, 3, 4, 5] as const) {
    text[`page${page}InitialsDate`] = signedDate;
  }

  if (values.ownerCount === "Two") {
    text.owner2Name = formatName(values.secondaryOwnerName as FullnameValue);
    text.owner2Phone = String(values.secondaryOwnerPhone ?? "").trim();
    text.owner2Email = String(values.secondaryOwnerEmail ?? "").trim();
  }

  setCheckbox(checkboxes, "nonStandardAddress", values.nonStandardAddress === "Yes");
  setCheckbox(checkboxes, "listingStatus_Active", true);
  setCheckbox(checkboxes, "listingType_Exclusive Right to Sell (ERS)", true);

  const houseDir = values.houseNumberDirection;
  if (houseDir === "N" || houseDir === "S" || houseDir === "E" || houseDir === "W") {
    setCheckbox(checkboxes, `houseDir_${houseDir}`, true);
  }
  const streetDir = values.streetDirection;
  if (streetDir === "N" || streetDir === "S" || streetDir === "E" || streetDir === "W") {
    setCheckbox(checkboxes, `streetDir_${streetDir}`, true);
  }

  const quadrant = values.listingQuadrant;
  if (quadrant) {
    setCheckbox(checkboxes, `quadrant_${quadrant}`, true);
  }

  setCheckbox(checkboxes, "hoa_Yes", values.hoa === "Yes");
  setCheckbox(checkboxes, "hoa_No", values.hoa === "No");
  if (values.hoa === "Yes") {
    const feeFreq = values.hoaFeeFrequency ?? "Monthly";
    if (feeFreq === "Monthly" || feeFreq === "Quarterly" || feeFreq === "Annually") {
      setCheckbox(checkboxes, `hoaFee_${feeFreq}`, true);
    }
    if (values.hoaChangeFeeType === "Percentage of sales price") {
      setCheckbox(checkboxes, "hoaChangeFee_Percentage of sales price", true);
    } else if (values.hoaChangeFeeType === "Dollar amount") {
      setCheckbox(checkboxes, "hoaChangeFee_Dollar amount", true);
    }
    if (values.hoaContactPhone) {
      setCheckbox(checkboxes, "hoaContactPhone_Voice", true);
    }
    if (values.hoaRentalCap === "Yes") {
      setCheckbox(checkboxes, "hoaRentalCap_Yes", true);
    } else if (values.hoaRentalCap === "No") {
      setCheckbox(checkboxes, "hoaRentalCap_No", true);
    }
    markSelected(checkboxes, "hoaAmenities", values.hoaAmenities as string[] | undefined);
  }

  if (values.shortTermRentals === "Yes") {
    setCheckbox(checkboxes, "shortTermRental_YES", true);
  } else if (values.shortTermRentals === "No") {
    setCheckbox(checkboxes, "shortTermRental_NO", true);
  }

  if (values.projectRestriction === "Yes") {
    setCheckbox(checkboxes, "projectRestriction_Yes", true);
  } else if (values.projectRestriction === "No") {
    setCheckbox(checkboxes, "projectRestriction_No", true);
  }
  if (values.seniorCommunity === "Yes") {
    setCheckbox(checkboxes, "seniorCommunity_Yes", true);
  } else if (values.seniorCommunity === "No") {
    setCheckbox(checkboxes, "seniorCommunity_No", true);
  }
  if (values.maintenanceFree === "Yes") {
    setCheckbox(checkboxes, "maintenanceFree_Yes", true);
  } else if (values.maintenanceFree === "No") {
    setCheckbox(checkboxes, "maintenanceFree_No", true);
  }

  setCheckbox(checkboxes, "hasSolar_Yes", values.solar === "Yes");
  setCheckbox(checkboxes, "hasSolar_No", values.solar === "No");
  if (values.solar === "Yes" && values.solarOwnership) {
    const ownership = SOLAR_OWNERSHIP_ALIASES[values.solarOwnership];
    if (ownership) {
      setCheckbox(checkboxes, `solarOwnership_${ownership}`, true);
    }
  }

  setCheckbox(checkboxes, "adu_Yes", values.adu === "Yes");
  setCheckbox(checkboxes, "adu_No", values.adu === "No");
  if (values.adu === "Yes") {
    if (values.aduType === "Attached") {
      setCheckbox(checkboxes, "aduType_Attached", true);
    } else if (values.aduType === "Detached") {
      setCheckbox(checkboxes, "aduType_Detached", true);
    }
    text.aduSqft = String(values.aduSqft ?? "").trim();
    text.aduBeds = String(values.aduBeds ?? "").trim();
    text.aduBaths = String(values.aduBaths ?? "").trim();
    setCheckbox(checkboxes, "aduKitchen_Yes", values.aduKitchen === "Yes");
    setCheckbox(checkboxes, "aduKitchen_No", values.aduKitchen === "No");
    setCheckbox(checkboxes, "aduSeparateEntrance_Yes", values.aduSeparateEntrance === "Yes");
    setCheckbox(checkboxes, "aduSeparateEntrance_No", values.aduSeparateEntrance === "No");
    setCheckbox(checkboxes, "aduSeparateWaterMeter_Yes", values.aduSeparateWaterMeter === "Yes");
    setCheckbox(checkboxes, "aduSeparateWaterMeter_No", values.aduSeparateWaterMeter === "No");
    setCheckbox(checkboxes, "aduSeparateGasMeter_Yes", values.aduSeparateGasMeter === "Yes");
    setCheckbox(checkboxes, "aduSeparateGasMeter_No", values.aduSeparateGasMeter === "No");
    setCheckbox(checkboxes, "aduSeparateElectricMeter_Yes", values.aduSeparateElectricMeter === "Yes");
    setCheckbox(checkboxes, "aduSeparateElectricMeter_No", values.aduSeparateElectricMeter === "No");
    setCheckbox(checkboxes, "aduCurrentlyRented_Yes", values.aduCurrentlyRented === "Yes");
    setCheckbox(checkboxes, "aduCurrentlyRented_No", values.aduCurrentlyRented === "No");
    text.aduMonthlyRent =
      values.aduCurrentlyRented === "Yes"
        ? String(values.aduMonthlyRent ?? "").replace(/[^0-9.]/g, "")
        : "";
    text.aduRemarks = String(values.aduRemarks ?? "").trim();
  }

  const propertyType = String(values["q11-propertytype"] ?? "");
  if (propertyType === "P.U.D.") {
    // Legacy drafts used P.U.D. as a property type
    setCheckbox(checkboxes, "pud_Yes", true);
    setCheckbox(checkboxes, "propertyType_Single Family", true);
  } else {
    const mapped = PROPERTY_TYPE_ALIASES[propertyType];
    if (mapped) {
      setCheckbox(checkboxes, `propertyType_${mapped}`, true);
    }
    if (values.pud === "Yes") {
      setCheckbox(checkboxes, "pud_Yes", true);
    } else if (values.pud === "No") {
      setCheckbox(checkboxes, "pud_No", true);
    } else {
      setCheckbox(checkboxes, "pud_No", true);
    }
  }
  if (values.pid === "Yes") {
    setCheckbox(checkboxes, "pid_Yes", true);
  } else if (values.pid === "No") {
    setCheckbox(checkboxes, "pid_No", true);
  }
  setCheckbox(
    checkboxes,
    "noAssignedParcelNumber",
    values.noAssignedParcelNumber === "Yes",
  );

  if (values.lotIrregularShape === "Yes") {
    setCheckbox(checkboxes, "lotIrregularShape_Yes", true);
  } else if (values.lotIrregularShape === "No") {
    setCheckbox(checkboxes, "lotIrregularShape_No", true);
  }

  const frontageFacing = values.frontageFacing;
  if (
    frontageFacing === "N" ||
    frontageFacing === "S" ||
    frontageFacing === "E" ||
    frontageFacing === "W" ||
    frontageFacing === "NE" ||
    frontageFacing === "SE" ||
    frontageFacing === "NW" ||
    frontageFacing === "SW"
  ) {
    setCheckbox(checkboxes, `frontageFacing_${frontageFacing}`, true);
  }

  const construction = CONSTRUCTION_ALIASES[String(values.constructionStatus ?? "")];
  if (construction) {
    setCheckbox(checkboxes, `constructionStatus_${construction}`, true);
  }

  const styleKey = STYLE_ALIASES[String(values["q51-styleof51"] ?? "")];
  if (styleKey) {
    setCheckbox(checkboxes, `style_${styleKey}`, true);
  }

  const shortSale = SHORT_SALE_ALIASES[String(values.shortSale ?? "")];
  if (shortSale) {
    setCheckbox(checkboxes, `specialListingConditions_${shortSale}`, true);
  }

  // Basement type from MLS multi-select
  markSelected(checkboxes, "basementType", values["q26-typea26"] as string[] | undefined);
  if (values.basementFinished === "Yes") {
    text.basementFinished = "100";
  } else if (values.basementFinished === "Partial") {
    text.basementFinished = "Partial";
  } else if (values.basementFinished === "No") {
    text.basementFinished = "0";
  }

  markSelected(checkboxes, "flooring", values["q33-flooring"] as string[] | undefined);
  markSelected(checkboxes, "interiorFeatures", values["q34-typea34"] as string[] | undefined);
  markSelected(checkboxes, "accessibility", values["q27-typea27"] as string[] | undefined);
  markSelected(checkboxes, "windowCoverings", values["q41-window-coverings"] as string[] | undefined);
  markSelected(checkboxes, "amenities", values["q42-amenities"] as string[] | undefined);
  markSelected(checkboxes, "airConditioning", values["q31-airconditioning"] as string[] | undefined);
  markSelected(checkboxes, "heating", values["q96-hvac96"] as string[] | undefined, HEATING_ALIASES);
  markSelected(checkboxes, "exterior", values["q32-typea32"] as string[] | undefined);
  markSelected(
    checkboxes,
    "exteriorFeatures",
    values["q29-typea29"] as string[] | undefined,
    EXTERIOR_FEATURE_ALIASES,
  );
  markSelected(checkboxes, "garageParking", values["q30-typea30"] as string[] | undefined, PARKING_ALIASES);
  markSelected(checkboxes, "driveway", values["q28-typea28"] as string[] | undefined, DRIVEWAY_ALIASES);

  setCheckbox(checkboxes, "poolAvailable_Yes", values["q184-doesthe"] === "Yes");
  setCheckbox(checkboxes, "poolAvailable_No", values["q184-doesthe"] === "No");
  markSelected(checkboxes, "poolFeatures", values["q63-pooltype"] as string[] | undefined);
  markSelected(checkboxes, "roof", values["q37-typea37"] as string[] | undefined);
  markSelected(
    checkboxes,
    "landscaping",
    values["q36-typea36"] as string[] | undefined,
    LANDSCAPING_ALIASES,
  );
  markSelected(checkboxes, "lotFacts", values["q43-lot-facts"] as string[] | undefined, LOT_FACT_ALIASES);

  const animalsSelected = values["q47-animals"] as string[] | undefined;
  setCheckbox(checkboxes, "petsAllowed_Yes", values.petsAllowed === "Yes");
  setCheckbox(checkboxes, "petsAllowed_No", values.petsAllowed === "No");
  if (values.petsAllowed === "No") {
    setCheckbox(checkboxes, "animals_None", true);
  } else if (values.petsAllowed === "Yes") {
    markSelected(checkboxes, "animals", animalsSelected);
  } else if (animalsSelected?.length) {
    // Legacy drafts without petsAllowed
    markSelected(checkboxes, "animals", animalsSelected);
    const hasNone = animalsSelected.includes("None");
    const hasOther = animalsSelected.some((a) => a !== "None");
    setCheckbox(checkboxes, "petsAllowed_Yes", hasOther);
    setCheckbox(checkboxes, "petsAllowed_No", hasNone && !hasOther);
  } else {
    const animals = String(values["q47-animals"] ?? "").trim();
    if (animals && animals !== "None") {
      setCheckbox(checkboxes, `animals_${animals}`, true);
      setCheckbox(checkboxes, "petsAllowed_Yes", true);
    } else if (animals === "None") {
      setCheckbox(checkboxes, "animals_None", true);
      setCheckbox(checkboxes, "petsAllowed_No", true);
    }
  }

  markSelected(checkboxes, "storage", values["q39-typea39"] as string[] | undefined);
  markSelected(
    checkboxes,
    "utilities",
    values["q35-connectedutilities"] as string[] | undefined,
    UTILITIES_ALIASES,
  );
  markSelected(checkboxes, "water", values["q44-water"] as string[] | undefined);
  markSelected(
    checkboxes,
    "telecommunications",
    values["q45-telecommunications"] as string[] | undefined,
    TELECOM_ALIASES,
  );
  markSelected(
    checkboxes,
    "environmentalCerts",
    values["q46-environmental-certs"] as string[] | undefined,
  );
  markSelected(
    checkboxes,
    "zoning",
    values["q38-zoning"] as string[] | undefined,
    ZONING_ALIASES,
  );
  markSelected(checkboxes, "terms", values["q40-typea40"] as string[] | undefined, TERMS_ALIASES);
  markSelected(checkboxes, "inclusions", values["q19-typea19"] as string[] | undefined);

  const occupancy = values["q191-propertyoccupancy"];
  if (occupancy === "Vacant / Immediate Appt Approval") {
    setCheckbox(checkboxes, "showInstructions_Vacant", true);
  } else if (occupancy === "Owner Occupied") {
    setCheckbox(checkboxes, "showInstructions_Call Owner / Appt", true);
  } else if (occupancy === "Tenant Occupied") {
    setCheckbox(checkboxes, "showInstructions_Call Tenant / Appt", true);
  }

  const signatureUrl = String(values["q20-signature"] ?? "").trim();
  if (signatureUrl) {
    images.owner1Signature = signatureUrl;
  }
  const signature2Url = String(values["q23-signature23"] ?? "").trim();
  if (signature2Url) {
    images.owner2Signature = signature2Url;
  }

  const initialsUrl = String(values["q20-initials"] ?? "").trim();
  if (initialsUrl) {
    for (const page of [0, 1, 2, 3, 4, 5] as const) {
      images[`page${page}Initials`] = initialsUrl;
    }
  }
  const initials2Url = String(values["q23-initials"] ?? "").trim();
  if (initials2Url) {
    for (const page of [0, 1, 2, 3, 4, 5] as const) {
      images[`page${page}Initials2`] = initials2Url;
    }
  }

  return { text, checkboxes, images };
}
