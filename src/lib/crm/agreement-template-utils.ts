const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isValidAgreementTemplateSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length > 0;
}

export function slugifyDisplayName(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
