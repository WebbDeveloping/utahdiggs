import { NextResponse } from "next/server";
import { requireEmailTemplateAdmin } from "@/lib/crm/email-template-admin";
import {
  getEmailBrandSettings,
  upsertEmailBrandSettings,
  validateEmailBrandTheme,
  type EmailBrandTheme,
} from "@/lib/email/brand-theme";

export async function GET() {
  const { response } = await requireEmailTemplateAdmin();
  if (response) return response;

  try {
    const theme = await getEmailBrandSettings();
    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Failed to load email brand settings:", error);
    return NextResponse.json(
      { error: "Failed to load brand settings." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const { response } = await requireEmailTemplateAdmin();
  if (response) return response;

  let body: Partial<EmailBrandTheme>;
  try {
    body = (await request.json()) as Partial<EmailBrandTheme>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const current = await getEmailBrandSettings();
    const theme: EmailBrandTheme = {
      primaryColor: body.primaryColor ?? current.primaryColor,
      pageBackground: body.pageBackground ?? current.pageBackground,
      cardBackground: body.cardBackground ?? current.cardBackground,
      bodyTextColor: body.bodyTextColor ?? current.bodyTextColor,
      mutedTextColor: body.mutedTextColor ?? current.mutedTextColor,
      linkColor: body.linkColor ?? current.linkColor,
      accentBackground: body.accentBackground ?? current.accentBackground,
      buttonRadius: body.buttonRadius ?? current.buttonRadius,
    };

    const validationError = validateEmailBrandTheme(theme);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const saved = await upsertEmailBrandSettings(theme);
    return NextResponse.json({ theme: saved });
  } catch (error) {
    console.error("Failed to save email brand settings:", error);
    return NextResponse.json(
      { error: "Failed to save brand settings." },
      { status: 500 },
    );
  }
}
