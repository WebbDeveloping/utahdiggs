import type { FullMlsInputValues } from "@/lib/mls-input/validation";
import { generateDataFormPdf } from "@/lib/signature/fill-uar-data-form-residential";
import { PREVIEW_SIGNATURE_PLACEHOLDER_PNG } from "@/lib/signature/preview-signature-placeholder";
import { resolveDataFormValues } from "@/lib/signature/resolve-data-form-values";

/** Image fields that should show placeholders when the seller has not signed yet. */
const PRIMARY_PLACEHOLDER_IMAGE_FIELDS = [
  "owner1Signature",
  "page0Initials",
  "page1Initials",
  "page2Initials",
  "page3Initials",
  "page4Initials",
  "page5Initials",
] as const;

/**
 * Soft-coerce draft wizard values for preview. Does not validate — incomplete
 * drafts intentionally produce a sparse filled PDF.
 */
export function coerceMlsPreviewValues(
  values: Record<string, unknown>,
): FullMlsInputValues {
  return values as FullMlsInputValues;
}

export async function buildDataFormPreviewPdf(
  values: Record<string, unknown>,
): Promise<Uint8Array> {
  const intakeValues = coerceMlsPreviewValues(values);
  const resolvedValues = resolveDataFormValues(intakeValues);
  const imageBytesByField: Record<string, Uint8Array> = {};

  for (const name of PRIMARY_PLACEHOLDER_IMAGE_FIELDS) {
    if (!resolvedValues.images[name]) {
      imageBytesByField[name] = PREVIEW_SIGNATURE_PLACEHOLDER_PNG;
    }
  }

  const { pdfBytes } = await generateDataFormPdf(intakeValues, {
    resolvedValues,
    imageBytesByField,
  });

  return pdfBytes;
}
