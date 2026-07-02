import type { ServicePlan } from "@/generated/prisma/client";
import {
  RIGHT_TO_SELL_AGREEMENT_TITLE,
  RIGHT_TO_SELL_FIXED_FEES,
  computeListingEndDate,
} from "@/content/right-to-sell-agreement";
import type {
  UarAgreementPrefill,
  UarAgreementPrefillInput,
  UarAgreementResolvedValues,
} from "@/types/uar-agreement";

export const UAR_AGREEMENT_TITLE = RIGHT_TO_SELL_AGREEMENT_TITLE;

export const UAR_FORM_FOOTER =
  "UAR FORM 8 — COPYRIGHT © UTAH ASSOCIATION OF REALTORS® — Revised 11.5.2024";

export {
  RIGHT_TO_SELL_BUYER_AGENT_PERCENT_OPTIONS as UAR_BUYER_AGENT_PERCENT_OPTIONS,
  RIGHT_TO_SELL_SQFT_SOURCE_OPTIONS as UAR_SQFT_SOURCE_OPTIONS,
} from "@/content/right-to-sell-agreement";

export function getUarBrokerConfig(): UarAgreementPrefill {
  return {
    company: process.env.UAR_BROKER_COMPANY ?? "Kelly Right Real Estate of Utah, LLC",
    agentName: process.env.UAR_BROKER_AGENT ?? "Blair Allen",
    listingTerm: "6 months from signed date",
    protectionPeriodMonths: "3",
    agentSignedDate: new Date().toISOString().slice(0, 10),
    cancellationTerms:
      "Seller may only cancel the listing agreement under to following conditions:\n1- There are no current active offers on the property\n2- The property is not under contract or pending to be sold\n3- Seller agrees to pay commission on any sale initiated and procured via advertising from the MLS, syndicated sites or advertising created and distributed by Utah Digs | Blair Allen | Kelly Right Real Estate",
    krFeePercent: RIGHT_TO_SELL_FIXED_FEES.krFeePercent,
    krFeeDollar: RIGHT_TO_SELL_FIXED_FEES.krFeeDollar,
    ubFeePercent: RIGHT_TO_SELL_FIXED_FEES.ubFeePercent,
    ubFeeDollar: RIGHT_TO_SELL_FIXED_FEES.ubFeeDollar,
  };
}

/** @deprecated Agreement fees are fixed at 2.5% / 1.5% per the right-to-sell form. */
export function getUarFeeConfig(_plan: ServicePlan): Pick<
  UarAgreementPrefill,
  "krFeePercent" | "krFeeDollar" | "ubFeePercent" | "ubFeeDollar"
> {
  return {
    krFeePercent: RIGHT_TO_SELL_FIXED_FEES.krFeePercent,
    krFeeDollar: RIGHT_TO_SELL_FIXED_FEES.krFeeDollar,
    ubFeePercent: RIGHT_TO_SELL_FIXED_FEES.ubFeePercent,
    ubFeeDollar: RIGHT_TO_SELL_FIXED_FEES.ubFeeDollar,
  };
}

export function getUarPlanLabel(plan: ServicePlan): string {
  return plan === "FULL_SERVICE" ? "Full Service (1.5%)" : "Virtual (1%)";
}

export function buildUarAgreementPrefill(_input: UarAgreementPrefillInput): UarAgreementPrefill {
  return getUarBrokerConfig();
}

export function formatSellerAddressPhone(email: string, phone: string): string {
  const parts = [email.trim(), phone.trim()].filter(Boolean);
  return parts.join(" · ");
}

export function resolveUarAgreementValues(
  form: Omit<
    UarAgreementResolvedValues,
    | keyof UarAgreementPrefill
    | "seller1FullName"
    | "seller2FullName"
    | "propertyFullAddress"
    | "listingEndDate"
    | "planLabel"
    | "seller1AddressPhone"
    | "seller2AddressPhone"
  >,
  prefill: UarAgreementPrefill,
  plan: ServicePlan,
): UarAgreementResolvedValues {
  const seller1FullName = `${form.seller1FirstName} ${form.seller1LastName}`.trim();
  const seller2FullName = `${form.seller2FirstName} ${form.seller2LastName}`.trim();
  const unit = form.propertyUnit.trim();
  const streetLine = unit
    ? `${form.propertyAddress}, ${unit}`
    : form.propertyAddress;

  return {
    ...form,
    ...prefill,
    seller1FullName,
    seller2FullName,
    propertyFullAddress: `${streetLine}, ${form.propertyCity}, ${form.propertyState} ${form.propertyZip}`,
    listingEndDate: computeListingEndDate(form.signedDate),
    planLabel: getUarPlanLabel(plan),
    seller1AddressPhone: formatSellerAddressPhone(form.sellerEmail, form.seller1Phone),
    seller2AddressPhone:
      form.multipleOwners === "YES"
        ? formatSellerAddressPhone(form.seller2Email, form.seller2Phone)
        : "",
  };
}

export function splitSellerName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) return { firstName: "", lastName: "" };

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}
