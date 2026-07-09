import { NextResponse } from "next/server";
import { requireEmailTemplateAdmin } from "@/lib/crm/email-template-admin";
import type { EmailBrandTheme } from "@/lib/email/brand-theme";
import {
  isValidEmailTemplateSlug,
  renderEmailTemplatePreview,
} from "@/lib/email/template-queries";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { response } = await requireEmailTemplateAdmin();
  if (response) return response;

  const { slug } = await context.params;
  if (!isValidEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  let body: { subject?: string; htmlBody?: string; brandTheme?: EmailBrandTheme } =
    {};
  try {
    body = (await request.json()) as {
      subject?: string;
      htmlBody?: string;
      brandTheme?: EmailBrandTheme;
    };
  } catch {
    // Preview with saved or default content when body is empty.
  }

  const rendered = await renderEmailTemplatePreview(slug, {
    subject: body.subject,
    htmlBody: body.htmlBody,
    brandTheme: body.brandTheme,
  });

  return NextResponse.json(rendered);
}
