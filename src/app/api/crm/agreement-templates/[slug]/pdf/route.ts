import { NextResponse } from "next/server";
import {
  fetchAgreementTemplateBytes,
  readLocalAgreementTemplateBytes,
} from "@/lib/signature/agreement-template-storage";
import { resolveAgreementTemplateFromRequest } from "@/lib/crm/agreement-template-api";
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

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await fetchAgreementTemplateBytes(template.slug, template.version);
  } catch {
    if (template.localFilename) {
      try {
        pdfBytes = await readLocalAgreementTemplateBytes({
          localFilename: template.localFilename,
        });
      } catch {
        return NextResponse.json({ error: "Template PDF not found." }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Template PDF not found." }, { status: 404 });
    }
  }

  const filename = template.localFilename ?? `${template.slug}-${template.version}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
