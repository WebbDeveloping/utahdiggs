import { NextResponse } from "next/server";
import {
  createEmptyFieldMap,
  parseAgreementFieldMap,
} from "@/lib/signature/agreement-field-map";
import {
  fetchAgreementFieldMap,
  readBundledAgreementFieldMap,
  saveAgreementFieldMap,
} from "@/lib/signature/agreement-field-map-storage";
import { resolveAgreementTemplateFromRequest } from "@/lib/crm/agreement-template-api";
import { resolveFieldMapSource } from "@/lib/crm/agreement-template-queries";
import { requireAgreementTemplateAdmin } from "@/lib/crm/agreement-template-admin";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response } = await requireAgreementTemplateAdmin();
  if (response) return response;

  const { slug: rawSlug } = await context.params;
  const { template, response: templateResponse } = await resolveAgreementTemplateFromRequest(
    rawSlug,
    request,
  );
  if (templateResponse) return templateResponse;

  const bundledFieldMap = await readBundledAgreementFieldMap(template.slug);

  try {
    const fieldMap = await fetchAgreementFieldMap(template.slug, template.version);
    const source = await resolveFieldMapSource(template.slug, template.version, fieldMap);
    return NextResponse.json({ fieldMap, source, template, bundledFieldMap });
  } catch {
    const fieldMap = createEmptyFieldMap(template.slug, template.version);
    return NextResponse.json({ fieldMap, source: "none", template, bundledFieldMap });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { response } = await requireAgreementTemplateAdmin();
  if (response) return response;

  const { slug: rawSlug } = await context.params;
  const { template, response: templateResponse } = await resolveAgreementTemplateFromRequest(
    rawSlug,
    request,
  );
  if (templateResponse) return templateResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const fieldMap = parseAgreementFieldMap(body);
    if (fieldMap.slug !== template.slug) {
      return NextResponse.json({ error: "Field map slug does not match URL." }, { status: 400 });
    }
    if (fieldMap.version !== template.version) {
      return NextResponse.json(
        { error: `Field map version must be ${template.version}.` },
        { status: 400 },
      );
    }

    const saved = await saveAgreementFieldMap(fieldMap);
    return NextResponse.json({
      fieldMap,
      pathname: saved.pathname,
      url: saved.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save field map.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
