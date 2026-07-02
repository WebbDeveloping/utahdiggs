/**
 * Coordinate map for UAR Form 8 (Exclusive Right to Sell) template version 2024-11-05.
 * PDF page size: 612 × 792 pt. Origin: bottom-left (pdf-lib convention).
 *
 * Source of truth: field-maps/uar-exclusive-right-to-sell-2024-11-05.json
 */
import type {
  PdfCheckboxField,
  PdfImageField,
  PdfTextField,
} from "@/lib/signature/agreement-field-map";
import uarExclusiveRightToSellFieldMap from "@/lib/signature/field-maps/uar-exclusive-right-to-sell-2024-11-05.json";

export type { PdfCheckboxField, PdfImageField, PdfTextField };

export const UAR_FORM_8_TEMPLATE_VERSION = uarExclusiveRightToSellFieldMap.version;

export const UAR_FORM_8_TEXT_FIELDS = uarExclusiveRightToSellFieldMap.textFields as Record<
  string,
  PdfTextField
>;

export const UAR_FORM_8_CHECKBOX_FIELDS = uarExclusiveRightToSellFieldMap.checkboxFields as Record<
  string,
  PdfCheckboxField
>;

export const UAR_FORM_8_IMAGE_FIELDS = uarExclusiveRightToSellFieldMap.imageFields as Record<
  string,
  PdfImageField
>;

/** Keys we render from UarAgreementResolvedValues (used by coverage test). */
export const UAR_FORM_8_MAPPED_VALUE_KEYS = (uarExclusiveRightToSellFieldMap.valueKeys ??
  []) as readonly string[];
