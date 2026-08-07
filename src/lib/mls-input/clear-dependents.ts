/**
 * When a Yes/No (or similar) gate flips away from the value that reveals
 * follow-ups, clear those dependent answers so stale data is not submitted.
 */

import {
  getLevelMatrixRowLabels,
  LEVEL_MATRIX_FIELD_ID,
  pruneLevelMatrixRows,
} from "./level-matrix-rows";

const OWNER_SHOWING_CONTACT_1 = [
  "q194-ownershowing",
  "q195-phonenumber",
  "q196-email",
] as const;

const OWNER_SHOWING_CONTACT_2 = [
  "q197-ownershowing197",
  "q198-ownershowing198",
  "q199-ownershowing199",
] as const;

const OWNER_SHOWING_FIELDS = [
  "q192-howmany",
  ...OWNER_SHOWING_CONTACT_1,
  ...OWNER_SHOWING_CONTACT_2,
] as const;

const TENANT_SHOWING_FIELDS = [
  "q193-howmany193",
  "q200-tenantshowing",
  "q201-ownershowing201",
  "q202-tenantshowing202",
  "q203-tenantshowing203",
  "q204-tenantshowing204",
  "q205-tenantshowing205",
] as const;

const CLEAR_WHEN_NOT: Record<
  string,
  { keepEquals: string; clear: string[] }
> = {
  nonStandardAddress: {
    keepEquals: "Yes",
    clear: ["directionsRemarks"],
  },
  hoa: {
    keepEquals: "Yes",
    clear: [
      "hoaFeeMonth",
      "hoaFeeFrequency",
      "hoaChangeFeeType",
      "hoaChangeFeeAmount",
      "hoaContact",
      "hoaContactPhone",
      "hoaRentalCap",
      "hoaAmenities",
      "hoaRemarks",
    ],
  },
  solar: {
    keepEquals: "Yes",
    clear: [
      "solarOwnership",
      "solarYearInstalled",
      "solarSystemSizeKw",
      "solarBatteryStorage",
      "solarLoanOrLien",
      "solarDocsAvailable",
      "solarCompanyName",
      "solarFinanceCompany",
      "solarMonthlyPayment",
      "solarAgreementTerm",
      "solarTransferable",
    ],
  },
  adu: {
    keepEquals: "Yes",
    clear: [
      "aduType",
      "aduSqft",
      "aduBeds",
      "aduBaths",
      "aduKitchen",
      "aduSeparateEntrance",
      "aduSeparateWaterMeter",
      "aduSeparateGasMeter",
      "aduSeparateElectricMeter",
      "aduCurrentlyRented",
      "aduMonthlyRent",
      "aduRemarks",
    ],
  },
  petsAllowed: {
    keepEquals: "Yes",
    clear: ["q47-animals"],
  },
  "q184-doesthe": {
    keepEquals: "Yes",
    clear: ["q63-pooltype"],
  },
  hasBasement: {
    keepEquals: "Yes",
    clear: ["q26-typea26", "basementFinished"],
  },
  ownerAddressSameAsListing: {
    keepEquals: "No",
    clear: ["ownerAddress"],
  },
};

/** Nested clear when solar ownership leaves a financed/leased/PPA path. */
const SOLAR_OWNERSHIP_CLEAR: Record<string, string[]> = {
  Owned: [
    "solarCompanyName",
    "solarFinanceCompany",
    "solarMonthlyPayment",
    "solarAgreementTerm",
    "solarTransferable",
  ],
  Leased: ["solarFinanceCompany"],
  "Power Purchase Agreement (PPA)": ["solarFinanceCompany"],
  Financed: ["solarCompanyName"],
};

type OwnerName = { first?: string; last?: string };

function cloneOwnerName(value: unknown): OwnerName | undefined {
  if (!value || typeof value !== "object") return undefined;
  const name = value as OwnerName;
  return {
    first: name.first ?? "",
    last: name.last ?? "",
  };
}

/** Prefill owner showing contacts from primary/secondary owner fields. */
export function applyOwnerOccupiedShowingAutofill(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...values };
  const ownerCount = values.ownerCount === "Two" ? "Two" : "One";
  next["q192-howmany"] = ownerCount;

  const primaryName = cloneOwnerName(values.primaryOwnerName);
  if (primaryName) next["q194-ownershowing"] = primaryName;
  if (typeof values.primaryOwnerPhone === "string") {
    next["q195-phonenumber"] = values.primaryOwnerPhone;
  }
  if (typeof values.primaryOwnerEmail === "string") {
    next["q196-email"] = values.primaryOwnerEmail;
  }

  if (ownerCount === "Two") {
    const secondaryName = cloneOwnerName(values.secondaryOwnerName);
    if (secondaryName) next["q197-ownershowing197"] = secondaryName;
    if (typeof values.secondaryOwnerPhone === "string") {
      next["q198-ownershowing198"] = values.secondaryOwnerPhone;
    }
    if (typeof values.secondaryOwnerEmail === "string") {
      next["q199-ownershowing199"] = values.secondaryOwnerEmail;
    }
  } else {
    for (const id of OWNER_SHOWING_CONTACT_2) {
      delete next[id];
    }
  }

  return next;
}

export function applyClearDependents(
  values: Record<string, unknown>,
  fieldId: string,
  nextValue: unknown,
): Record<string, unknown> {
  let next = { ...values, [fieldId]: nextValue };

  const gate = CLEAR_WHEN_NOT[fieldId];
  if (gate && nextValue !== gate.keepEquals) {
    for (const id of gate.clear) {
      delete next[id];
    }
  }

  if (fieldId === "solarOwnership" && typeof nextValue === "string") {
    const toClear = SOLAR_OWNERSHIP_CLEAR[nextValue];
    if (toClear) {
      for (const id of toClear) {
        delete next[id];
      }
    }
  }

  if (
    fieldId === "hoaChangeFeeType" &&
    nextValue !== "Percentage of sales price" &&
    nextValue !== "Dollar amount"
  ) {
    delete next.hoaChangeFeeAmount;
  }

  if (fieldId === "q191-propertyoccupancy") {
    if (nextValue === "Owner Occupied") {
      for (const id of TENANT_SHOWING_FIELDS) {
        delete next[id];
      }
      next = applyOwnerOccupiedShowingAutofill(next);
    } else if (nextValue === "Tenant Occupied") {
      for (const id of OWNER_SHOWING_FIELDS) {
        delete next[id];
      }
    } else {
      for (const id of [...OWNER_SHOWING_FIELDS, ...TENANT_SHOWING_FIELDS]) {
        delete next[id];
      }
    }
  }

  if (fieldId === "q192-howmany" && nextValue !== "Two") {
    for (const id of OWNER_SHOWING_CONTACT_2) {
      delete next[id];
    }
  }

  if (fieldId === "q193-howmany193" && nextValue !== "Two") {
    delete next["q203-tenantshowing203"];
    delete next["q204-tenantshowing204"];
    delete next["q205-tenantshowing205"];
  }

  if (fieldId === "ownerCount" && next["q191-propertyoccupancy"] === "Owner Occupied") {
    next = applyOwnerOccupiedShowingAutofill(next);
  }

  if (fieldId === "hasBasement" || fieldId === "levelCount") {
    const matrix = next[LEVEL_MATRIX_FIELD_ID];
    const visibleLabels = getLevelMatrixRowLabels(next);
    const pruned = pruneLevelMatrixRows(matrix, visibleLabels);
    if (pruned === undefined) {
      delete next[LEVEL_MATRIX_FIELD_ID];
    } else {
      next[LEVEL_MATRIX_FIELD_ID] = pruned;
    }
  }

  return next;
}
