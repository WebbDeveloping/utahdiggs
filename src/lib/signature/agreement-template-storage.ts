import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import {
  AGREEMENT_TEMPLATE_DEFINITIONS,
  buildAgreementTemplatePathname,
  type AgreementTemplateDefinition,
} from "@/lib/signature/agreement-template-definitions";
import { getPrivateBlobConfig } from "@/lib/storage/blob";

export type AgreementTemplateManifestEntry = {
  slug: string;
  version: string;
  revisionLabel: string;
  displayName: string;
  pathname: string;
  url: string;
  contentHash: string;
  byteSize: number;
  uploadedAt: string;
};

export type AgreementTemplateManifest = {
  uploadedAt: string;
  templates: AgreementTemplateManifestEntry[];
};

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function defaultLocalPdfDir(): string {
  return path.join(process.cwd(), "example-code", "pdfs");
}

export async function readLocalAgreementTemplateBytes(
  definition: Pick<AgreementTemplateDefinition, "localFilename">,
  localPdfDir = defaultLocalPdfDir(),
): Promise<Uint8Array> {
  const filePath = path.join(localPdfDir, definition.localFilename);
  const buffer = await readFile(filePath);
  return new Uint8Array(buffer);
}

export async function uploadAgreementTemplatePdf(
  pathname: string,
  pdfBytes: Uint8Array,
): Promise<{ pathname: string; url: string; contentHash: string; byteSize: number }> {
  const privateConfig = getPrivateBlobConfig();
  if (!privateConfig) {
    throw new Error(
      "BLOB_PRIVATE_READ_WRITE_TOKEN is not set. Agreement templates must use the private Vercel Blob store.",
    );
  }

  const contentHash = sha256Hex(pdfBytes);

  const result = await put(pathname, Buffer.from(pdfBytes), {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: privateConfig.token,
    storeId: privateConfig.storeId,
  });

  return {
    pathname,
    url: result.url,
    contentHash,
    byteSize: pdfBytes.byteLength,
  };
}

/** @deprecated Use uploadAgreementTemplatePdf with DB-backed templates. */
export async function uploadAgreementTemplate(
  definition: AgreementTemplateDefinition,
  pdfBytes: Uint8Array,
): Promise<AgreementTemplateManifestEntry> {
  const pathname = buildAgreementTemplatePathname(definition.blobFilename);
  const uploaded = await uploadAgreementTemplatePdf(pathname, pdfBytes);

  return {
    slug: definition.slug,
    version: definition.version,
    revisionLabel: definition.revisionLabel,
    displayName: definition.displayName,
    pathname: uploaded.pathname,
    url: uploaded.url,
    contentHash: uploaded.contentHash,
    byteSize: uploaded.byteSize,
    uploadedAt: new Date().toISOString(),
  };
}

/** @deprecated CLI script only — templates are managed via CRM admin. */
export async function uploadAllAgreementTemplates(
  localPdfDir = defaultLocalPdfDir(),
): Promise<AgreementTemplateManifest> {
  const templates: AgreementTemplateManifestEntry[] = [];

  for (const definition of AGREEMENT_TEMPLATE_DEFINITIONS) {
    const pdfBytes = await readLocalAgreementTemplateBytes(definition, localPdfDir);
    templates.push(await uploadAgreementTemplate(definition, pdfBytes));
  }

  return {
    uploadedAt: new Date().toISOString(),
    templates,
  };
}

async function readBlobTemplateBytes(pathname: string): Promise<Uint8Array | null> {
  const privateConfig = getPrivateBlobConfig();
  if (!privateConfig) {
    return null;
  }

  const result = await get(pathname, {
    access: "private",
    token: privateConfig.token,
    storeId: privateConfig.storeId,
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }

  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  return bytes;
}

export async function fetchAgreementTemplateBytes(
  slug: string,
  version?: string,
): Promise<Uint8Array> {
  const { getAgreementTemplateOrThrow } = await import("@/lib/crm/agreement-template-queries");
  const template = await getAgreementTemplateOrThrow(slug, version);
  const blobBytes = await readBlobTemplateBytes(template.blobPathname);

  if (blobBytes) {
    return blobBytes;
  }

  if (template.localFilename) {
    return readLocalAgreementTemplateBytes({ localFilename: template.localFilename });
  }

  throw new Error(`Agreement template not found in blob storage: ${template.blobPathname}`);
}

export async function fetchAgreementTemplateBytesByPathname(
  pathname: string,
): Promise<Uint8Array> {
  const blobBytes = await readBlobTemplateBytes(pathname);
  if (!blobBytes) {
    throw new Error(`Agreement template not found in blob storage: ${pathname}`);
  }
  return blobBytes;
}
