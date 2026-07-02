import { NextResponse } from "next/server";
import { parseAgreementFieldMap } from "@/lib/signature/agreement-field-map";
import {
  fetchAgreementTemplateBytes,
  readLocalAgreementTemplateBytes,
} from "@/lib/signature/agreement-template-storage";
import { generateFieldMapDebugPdf } from "@/lib/signature/draw-field-map-debug-overlay";
import { fillUarForm8TemplatePdf } from "@/lib/signature/fill-uar-form-8-template";
import { buildUarAgreementPreviewInput } from "@/lib/signature/uar-agreement-preview-fixture";
import { resolveAgreementTemplateFromRequest } from "@/lib/crm/agreement-template-api";
import { isUarExclusiveRightToSellSlug } from "@/lib/crm/agreement-template-queries";
import { requireAgreementTemplateAdmin } from "@/lib/crm/agreement-template-admin";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { response } = await requireAgreementTemplateAdmin();
  if (response) return response;

  const { slug: rawSlug } = await context.params;
  const { template, response: templateResponse } = await resolveAgreementTemplateFromRequest(
    rawSlug,
    request,
  );
  if (templateResponse) return templateResponse;

  let body: { fieldMap?: unknown; mode?: "debug" | "fill" } = {};
  try {
    body = (await request.json()) as { fieldMap?: unknown; mode?: "debug" | "fill" };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.fieldMap) {
    return NextResponse.json({ error: "fieldMap is required." }, { status: 400 });
  }

  let fieldMap;
  try {
    fieldMap = parseAgreementFieldMap(body.fieldMap);
    if (fieldMap.slug !== template.slug) {
      return NextResponse.json({ error: "Field map slug does not match URL." }, { status: 400 });
    }
    if (fieldMap.version !== template.version) {
      return NextResponse.json(
        { error: `Field map version must be ${template.version}.` },
        { status: 400 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid field map.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let templateBytes: Uint8Array;
  try {
    templateBytes = await fetchAgreementTemplateBytes(template.slug, template.version);
  } catch {
    if (template.localFilename) {
      try {
        templateBytes = await readLocalAgreementTemplateBytes({
          localFilename: template.localFilename,
        });
      } catch {
        return NextResponse.json({ error: "Template PDF not found." }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Template PDF not found." }, { status: 404 });
    }
  }

  const mode = body.mode ?? "debug";
  let pdfBytes: Uint8Array;

  if (mode === "fill" && isUarExclusiveRightToSellSlug(template.slug)) {
    pdfBytes = await fillUarForm8TemplatePdf(buildUarAgreementPreviewInput(), {
      templateBytes,
      fieldMap,
      includeDocumentHashOnAddendum: false,
    });
  } else {
    pdfBytes = await generateFieldMapDebugPdf(templateBytes, fieldMap);
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${template.slug}-preview.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
