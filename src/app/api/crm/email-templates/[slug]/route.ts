import { NextResponse } from "next/server";
import { requireEmailTemplateAdmin } from "@/lib/crm/email-template-admin";
import type { EmailBrandTheme } from "@/lib/email/brand-theme";
import {
  getEmailTemplateDetail,
  isValidEmailTemplateSlug,
  resetEmailTemplateToDefault,
  upsertEmailTemplate,
} from "@/lib/email/template-queries";
import { validateEmailTemplate } from "@/lib/email/validate-template";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { response } = await requireEmailTemplateAdmin();
  if (response) return response;

  const { slug } = await context.params;
  if (!isValidEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  const template = await getEmailTemplateDetail(slug);
  return NextResponse.json({ template });
}

export async function PUT(request: Request, context: RouteContext) {
  const { response } = await requireEmailTemplateAdmin();
  if (response) return response;

  const { slug } = await context.params;
  if (!isValidEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  let body: { subject?: string; htmlBody?: string; reset?: boolean };
  try {
    body = (await request.json()) as {
      subject?: string;
      htmlBody?: string;
      reset?: boolean;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.reset) {
    const template = await resetEmailTemplateToDefault(slug);
    const detail = await getEmailTemplateDetail(slug);
    return NextResponse.json({ template: detail, record: template });
  }

  const subject = body.subject?.trim();
  const htmlBody = body.htmlBody?.trim();

  if (!subject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!htmlBody) {
    return NextResponse.json({ error: "HTML body is required." }, { status: 400 });
  }

  const definition = await getEmailTemplateDetail(slug);
  const knownVariables = definition?.variables.map((variable) => variable.name) ?? [];
  const validation = validateEmailTemplate(htmlBody, subject, knownVariables);

  if (validation.errors.length > 0) {
    return NextResponse.json(
      { error: validation.errors[0], errors: validation.errors },
      { status: 400 },
    );
  }

  await upsertEmailTemplate({ slug, subject, htmlBody });
  const template = await getEmailTemplateDetail(slug);
  return NextResponse.json({ template, warnings: validation.warnings });
}
