export type EmailBrandTheme = {
  primaryColor: string;
  pageBackground: string;
  cardBackground: string;
  bodyTextColor: string;
  mutedTextColor: string;
  linkColor: string;
  accentBackground: string;
  buttonRadius: string;
};

export const DEFAULT_EMAIL_BRAND_THEME: EmailBrandTheme = {
  primaryColor: "#1a3a5c",
  pageBackground: "#F1F5F9",
  cardBackground: "#ffffff",
  bodyTextColor: "#1E293B",
  mutedTextColor: "#64748B",
  linkColor: "#1a3a5c",
  accentBackground: "#EFF6FF",
  buttonRadius: "10px",
};

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function brandThemeToVars(
  theme: EmailBrandTheme,
): Record<string, string> {
  return {
    brandPrimary: theme.primaryColor,
    brandPageBg: theme.pageBackground,
    brandCardBg: theme.cardBackground,
    brandText: theme.bodyTextColor,
    brandMuted: theme.mutedTextColor,
    brandLink: theme.linkColor,
    brandAccentBg: theme.accentBackground,
    brandButtonRadius: theme.buttonRadius,
  };
}

export function validateEmailBrandTheme(
  theme: Partial<EmailBrandTheme>,
): string | null {
  const colorFields: (keyof EmailBrandTheme)[] = [
    "primaryColor",
    "pageBackground",
    "cardBackground",
    "bodyTextColor",
    "mutedTextColor",
    "linkColor",
    "accentBackground",
  ];

  for (const field of colorFields) {
    const value = theme[field];
    if (value !== undefined && !HEX_COLOR_PATTERN.test(value)) {
      return `Invalid color for ${field}: ${value}`;
    }
  }

  if (
    theme.buttonRadius !== undefined &&
    !/^\d+px$/.test(theme.buttonRadius.trim())
  ) {
    return `Invalid button radius: ${theme.buttonRadius}`;
  }

  return null;
}
