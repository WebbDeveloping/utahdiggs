/** Staff/ops defaults applied to MLS intake; hidden from the seller form. */

export const MLS_STAFF_DEFAULTS = {
  nonStandardAddress: "No",
  hoa: "No",
  listingType: "Exclusive Right to Sell (ERS)",
  contactType: "Assistant",
  appointmentContact: "ALIGNED SHOWINGS",
  contactPhone1: "(801) 337-5057",
  contactPhone2: "",
  listingAgentName: "Blair Allen",
  listingCoAgentName: "",
  listingOfficeName: "Kelly Right Real Estate",
  "q100-showinginstructions": "Call showing service",
  showInstructions: [
    "Call Showing Service",
    "Use Aligned Showings",
    "Key Box: Electronic",
  ],
  "q40-typea40": ["Cash", "Conventional"],
} as const;

export function mergeMlsStaffDefaults(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...values };
  for (const [key, value] of Object.entries(MLS_STAFF_DEFAULTS)) {
    const current = next[key];
    const empty =
      current === undefined ||
      current === null ||
      current === "" ||
      (Array.isArray(current) && current.length === 0);
    if (empty) {
      next[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  return next;
}

export function formatMlsAgreementDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/** Effective date = signed date; expiration = signed date + 6 months. */
export function listingAgreementDateDefaults(agreementSignedAt: Date): {
  listingEffectiveDate: string;
  listingExpirationDate: string;
} {
  const effective = new Date(agreementSignedAt);
  const expiration = new Date(agreementSignedAt);
  expiration.setMonth(expiration.getMonth() + 6);
  return {
    listingEffectiveDate: formatMlsAgreementDate(effective),
    listingExpirationDate: formatMlsAgreementDate(expiration),
  };
}
