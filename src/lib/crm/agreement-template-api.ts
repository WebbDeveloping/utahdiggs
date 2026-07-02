import { NextResponse } from "next/server";
import { getAgreementTemplate } from "@/lib/crm/agreement-template-queries";
import { isValidAgreementTemplateSlug } from "@/lib/crm/agreement-template-utils";

export function parseTemplateVersion(request: Request): string | undefined {
  const url = new URL(request.url);
  const version = url.searchParams.get("version");
  return version && version.length > 0 ? version : undefined;
}

export async function resolveAgreementTemplateFromRequest(
  slug: string,
  request: Request,
) {
  if (!isValidAgreementTemplateSlug(slug)) {
    return {
      template: null,
      response: NextResponse.json({ error: "Invalid template slug." }, { status: 400 }),
    };
  }

  const version = parseTemplateVersion(request);
  const template = await getAgreementTemplate(slug, version);

  if (!template) {
    return {
      template: null,
      response: NextResponse.json({ error: "Unknown template slug." }, { status: 404 }),
    };
  }

  return { template, response: null };
}
