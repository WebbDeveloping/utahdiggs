import { prisma } from "@/lib/db";
import {
  DEFAULT_EMAIL_BRAND_THEME,
  type EmailBrandTheme,
} from "@/lib/email/email-brand-config";

export {
  DEFAULT_EMAIL_BRAND_THEME,
  brandThemeToVars,
  validateEmailBrandTheme,
  type EmailBrandTheme,
} from "@/lib/email/email-brand-config";

function toTheme(row: {
  primaryColor: string;
  pageBackground: string;
  cardBackground: string;
  bodyTextColor: string;
  mutedTextColor: string;
  linkColor: string;
  accentBackground: string;
  buttonRadius: string;
}): EmailBrandTheme {
  return {
    primaryColor: row.primaryColor,
    pageBackground: row.pageBackground,
    cardBackground: row.cardBackground,
    bodyTextColor: row.bodyTextColor,
    mutedTextColor: row.mutedTextColor,
    linkColor: row.linkColor,
    accentBackground: row.accentBackground,
    buttonRadius: row.buttonRadius,
  };
}

export async function getEmailBrandSettings(): Promise<EmailBrandTheme> {
  const row = await prisma.emailBrandSettings.findUnique({
    where: { id: "default" },
  });

  if (!row) {
    return DEFAULT_EMAIL_BRAND_THEME;
  }

  return toTheme(row);
}

export async function upsertEmailBrandSettings(
  theme: EmailBrandTheme,
): Promise<EmailBrandTheme> {
  const row = await prisma.emailBrandSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...theme,
    },
    update: theme,
  });

  return toTheme(row);
}

export async function seedEmailBrandSettings(): Promise<void> {
  await prisma.emailBrandSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...DEFAULT_EMAIL_BRAND_THEME,
    },
    update: {},
  });
}
