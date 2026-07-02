import { NextResponse } from "next/server";
import {
  agreementTemplateExists,
  createAgreementTemplate,
  listAgreementTemplatesWithFieldMapStatus,
} from "@/lib/crm/agreement-template-queries";
import {
  isValidAgreementTemplateSlug,
  slugifyDisplayName,
} from "@/lib/crm/agreement-template-utils";
import { requireAgreementTemplateAdmin } from "@/lib/crm/agreement-template-admin";
import {
  buildAgreementTemplateBlobFilename,
  buildAgreementTemplatePathname,
} from "@/lib/signature/agreement-template-definitions";
import { uploadAgreementTemplatePdf } from "@/lib/signature/agreement-template-storage";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function GET() {
  const { response } = await requireAgreementTemplateAdmin();
  if (response) return response;

  const templates = await listAgreementTemplatesWithFieldMapStatus();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const { response } = await requireAgreementTemplateAdmin();
  if (response) return response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  const revisionLabel = String(formData.get("revisionLabel") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput || slugifyDisplayName(displayName);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
  }
  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }
  if (!version) {
    return NextResponse.json({ error: "Version is required." }, { status: 400 });
  }
  if (!isValidAgreementTemplateSlug(slug)) {
    return NextResponse.json(
      { error: "Slug must contain only lowercase letters, numbers, and hyphens." },
      { status: 400 },
    );
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "PDF must be 10 MB or smaller." }, { status: 400 });
  }

  if (await agreementTemplateExists(slug, version)) {
    return NextResponse.json(
      { error: `A template with slug "${slug}" and version "${version}" already exists.` },
      { status: 409 },
    );
  }

  const pdfBytes = new Uint8Array(await file.arrayBuffer());
  const blobFilename = buildAgreementTemplateBlobFilename(slug, version);
  const blobPathname = buildAgreementTemplatePathname(blobFilename);

  let uploaded;
  try {
    uploaded = await uploadAgreementTemplatePdf(blobPathname, pdfBytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const template = await createAgreementTemplate({
    slug,
    version,
    displayName,
    revisionLabel: revisionLabel || null,
    blobPathname: uploaded.pathname,
    contentHash: uploaded.contentHash,
    byteSize: uploaded.byteSize,
  });

  return NextResponse.json({ template }, { status: 201 });
}
