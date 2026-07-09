import { NextResponse } from "next/server";
import { requireEmailTemplateAdmin } from "@/lib/crm/email-template-admin";
import {
  isValidEmailTemplateSlug,
  renderEmailTemplatePreview,
} from "@/lib/email/template-queries";
import { sendEmail } from "@/lib/email/send";
import type { EmailBrandTheme } from "@/lib/email/brand-theme";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { user, email, response } = await requireEmailTemplateAdmin();
  if (response || !user) return response;

  const { slug } = await context.params;
  if (!isValidEmailTemplateSlug(slug)) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  let body: {
    subject?: string;
    htmlBody?: string;
    to?: string;
    brandTheme?: EmailBrandTheme;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const to = body.to?.trim() || email;
  if (!to) {
    return NextResponse.json(
      { error: "No recipient email address available." },
      { status: 400 },
    );
  }

  try {
    const rendered = await renderEmailTemplatePreview(slug, {
      subject: body.subject,
      htmlBody: body.htmlBody,
      brandTheme: body.brandTheme,
    });

    await sendEmail({
      to,
      subject: `[Test] ${rendered.subject}`,
      html: rendered.html,
    });

    return NextResponse.json({ ok: true, to });
  } catch (sendError) {
    const message =
      sendError instanceof Error ? sendError.message : "Failed to send test email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
