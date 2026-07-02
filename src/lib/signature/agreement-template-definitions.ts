export const AGREEMENT_TEMPLATE_PATH_PREFIX = "templates/agreements/" as const;

/** Slug used by production UAR Form 8 signing pipeline. */
export const UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG = "uar-exclusive-right-to-sell" as const;

/** Narrow union for templates with hardcoded production signing support. */
export type ProductionAgreementTemplateSlug = typeof UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG;

/** @deprecated Use string slugs from AgreementTemplate DB records. Kept for legacy CLI upload. */
export type AgreementTemplateSlug = ProductionAgreementTemplateSlug | "uar-data-form-residential";

/** @deprecated Legacy static definition used by CLI upload script only. */
export type AgreementTemplateDefinition = {
  slug: AgreementTemplateSlug;
  version: string;
  revisionLabel: string;
  localFilename: string;
  blobFilename: string;
  displayName: string;
};

/** @deprecated Legacy static registry — templates are stored in the database. */
export const AGREEMENT_TEMPLATE_DEFINITIONS: AgreementTemplateDefinition[] = [
  {
    slug: "uar-exclusive-right-to-sell",
    version: "2024-11-05",
    revisionLabel: "UAR Form 8 — Revised 11.5.2024",
    localFilename: "Exclusive Right to Sell Listing Agreement - UAR.pdf",
    blobFilename: "uar-exclusive-right-to-sell-2024-11-05.pdf",
    displayName: "Exclusive Right to Sell Listing Agreement & Agency Disclosure",
  },
  {
    slug: "uar-data-form-residential",
    version: "2024-11-05",
    revisionLabel: "URE Data Form — Residential",
    localFilename: "Data Form - Residential - URE.pdf",
    blobFilename: "uar-data-form-residential-2024-11-05.pdf",
    displayName: "Data Form — Residential",
  },
];

export function buildAgreementTemplatePathname(blobFilename: string): string {
  return `${AGREEMENT_TEMPLATE_PATH_PREFIX}${blobFilename}`;
}

export function buildAgreementTemplateBlobFilename(slug: string, version: string): string {
  return `${slug}-${version}.pdf`;
}

/** @deprecated Use getAgreementTemplate() from agreement-template-queries. */
export function getAgreementTemplateDefinition(
  slug: AgreementTemplateSlug,
): AgreementTemplateDefinition | undefined {
  return AGREEMENT_TEMPLATE_DEFINITIONS.find((template) => template.slug === slug);
}
