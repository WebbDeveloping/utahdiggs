import {
  FINANCING_TYPE_OPTIONS,
  type FinancingType,
  type OfferSubmissionFieldErrors,
  type OfferSubmissionInput,
} from "@/types/offer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseRequiredPrice(value: string): number | null {
  const parsed = parseOptionalNumber(value);
  if (parsed == null || parsed <= 0) return null;
  return parsed;
}

function parseOptionalDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function parseFinancingType(value: string): FinancingType | null {
  if ((FINANCING_TYPE_OPTIONS as readonly string[]).includes(value)) {
    return value as FinancingType;
  }
  return null;
}

export function parseOfferSubmissionFormData(formData: FormData): {
  input: OfferSubmissionInput | null;
  fieldErrors: OfferSubmissionFieldErrors;
  honeypotTriggered: boolean;
} {
  const fieldErrors: OfferSubmissionFieldErrors = {};

  if (asString(formData.get("website"))) {
    return { input: null, fieldErrors, honeypotTriggered: true };
  }

  const listingSlug = asString(formData.get("listingSlug"));
  const buyersAgent = asString(formData.get("buyersAgent"));
  const buyerAgentEmail = asString(formData.get("buyerAgentEmail"));
  const buyerAgentPhone = asString(formData.get("buyerAgentPhone"));
  const offerPriceRaw = asString(formData.get("offerPrice"));
  const financingTypeRaw = asString(formData.get("financingType"));
  const offerContractUrl = asString(formData.get("offerContractUrl"));
  const preApprovalUrl = asString(formData.get("preApprovalUrl"));

  if (!listingSlug) fieldErrors.listingSlug = "Listing not found.";
  if (!buyersAgent) fieldErrors.buyersAgent = "Buyer's agent name is required.";
  if (!buyerAgentEmail) {
    fieldErrors.buyerAgentEmail = "Agent email is required.";
  } else if (!EMAIL_PATTERN.test(buyerAgentEmail)) {
    fieldErrors.buyerAgentEmail = "Enter a valid email address.";
  }
  if (!buyerAgentPhone) {
    fieldErrors.buyerAgentPhone = "Agent phone is required.";
  }

  const offerPrice = parseRequiredPrice(offerPriceRaw);
  if (offerPrice == null) {
    fieldErrors.offerPrice = "Enter a valid offer price.";
  }

  const financingType = parseFinancingType(financingTypeRaw);
  if (!financingType) {
    fieldErrors.financingType = "Select a financing type.";
  }

  if (!offerContractUrl) {
    fieldErrors.offerContractUrl = "Offer contract PDF is required.";
  }
  if (!preApprovalUrl) {
    fieldErrors.preApprovalUrl = "Pre-approval letter PDF is required.";
  }

  const buyerEmail = asString(formData.get("buyerEmail"));
  if (buyerEmail && !EMAIL_PATTERN.test(buyerEmail)) {
    fieldErrors.buyerEmail = "Enter a valid buyer email address.";
  }

  const earnestMoneyRaw = asString(formData.get("earnestMoney"));
  const earnestMoney = parseOptionalNumber(earnestMoneyRaw);
  if (earnestMoneyRaw && earnestMoney == null) {
    fieldErrors.earnestMoney = "Enter a valid earnest money amount.";
  }

  const closingDateRaw = asString(formData.get("closingDate"));
  const closingDate = parseOptionalDate(closingDateRaw);
  if (closingDateRaw && !closingDate) {
    fieldErrors.closingDate = "Enter a valid closing date.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { input: null, fieldErrors, honeypotTriggered: false };
  }

  return {
    input: {
      listingSlug,
      buyersAgent,
      buyerAgentEmail,
      buyerAgentPhone,
      offerPrice: offerPrice!,
      financingType: financingType!,
      offerContractUrl,
      preApprovalUrl,
      buyerName: asString(formData.get("buyerName")) || undefined,
      buyerEmail: buyerEmail || undefined,
      buyerPhone: asString(formData.get("buyerPhone")) || undefined,
      earnestMoney,
      closingDate,
      inspectionPeriod: asString(formData.get("inspectionPeriod")) || undefined,
      appraisalGap: asString(formData.get("appraisalGap")) || undefined,
      contingencies: asString(formData.get("contingencies")) || undefined,
      additionalTerms: asString(formData.get("additionalTerms")) || undefined,
    },
    fieldErrors,
    honeypotTriggered: false,
  };
}
