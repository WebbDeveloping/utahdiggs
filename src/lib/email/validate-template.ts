const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;
const UNCLOSED_VARIABLE_PATTERN = /\{\{[^}]*$/;

export type TemplateValidationResult = {
  warnings: string[];
  errors: string[];
};

const BRAND_VARIABLES = [
  "brandPrimary",
  "brandPageBg",
  "brandCardBg",
  "brandText",
  "brandMuted",
  "brandLink",
  "brandAccentBg",
  "brandButtonRadius",
];

export function validateEmailTemplate(
  htmlBody: string,
  subject: string,
  knownVariables: string[],
): TemplateValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const known = new Set([...knownVariables, ...BRAND_VARIABLES]);
  const combined = `${subject}\n${htmlBody}`;

  if (UNCLOSED_VARIABLE_PATTERN.test(combined)) {
    errors.push("Template contains an unclosed merge variable (missing `}}`).");
  }

  const referenced = new Set<string>();
  for (const match of combined.matchAll(VARIABLE_PATTERN)) {
    referenced.add(match[1]);
  }

  for (const name of referenced) {
    if (!known.has(name)) {
      warnings.push(`Unknown merge variable: {{${name}}}`);
    }
  }

  for (const name of knownVariables) {
    if (!referenced.has(name)) {
      warnings.push(`Defined variable never used: {{${name}}}`);
    }
  }

  return { warnings, errors };
}
