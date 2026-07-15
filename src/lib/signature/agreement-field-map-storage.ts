import { readFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import {
  AGREEMENT_FIELD_MAP_PATH_PREFIX,
  buildAgreementFieldMapPathname,
  parseAgreementFieldMap,
  type AgreementFieldMap,
} from "@/lib/signature/agreement-field-map";
import {
  UAR_DATA_FORM_RESIDENTIAL_SLUG,
  UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG,
} from "@/lib/signature/agreement-template-definitions";
import { getPrivateBlobConfig } from "@/lib/storage/blob";

import uarExclusiveRightToSellFieldMap from "@/lib/signature/field-maps/uar-exclusive-right-to-sell-2024-11-05.json";
import uarDataFormResidentialFieldMap from "@/lib/signature/field-maps/uar-data-form-residential-2024-11-05.json";

const BUNDLED_FIELD_MAPS: Partial<Record<string, AgreementFieldMap>> = {
  [UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG]: parseAgreementFieldMap(uarExclusiveRightToSellFieldMap),
  [UAR_DATA_FORM_RESIDENTIAL_SLUG]: parseAgreementFieldMap(uarDataFormResidentialFieldMap),
};

function defaultBundledFieldMapsDir(): string {
  return path.join(process.cwd(), "src/lib/signature/field-maps");
}

export async function readBundledAgreementFieldMap(
  slug: string,
): Promise<AgreementFieldMap | null> {
  const bundled = BUNDLED_FIELD_MAPS[slug];
  if (bundled) {
    return bundled;
  }

  try {
    const dir = defaultBundledFieldMapsDir();
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(dir);
    const match = files.find((file) => file.startsWith(`${slug}-`) && file.endsWith(".json"));
    if (!match) {
      return null;
    }
    const raw = await readFile(path.join(dir, match), "utf8");
    return parseAgreementFieldMap(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function readBlobFieldMapBytes(pathname: string): Promise<Uint8Array | null> {
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

export async function fetchAgreementFieldMap(
  slug: string,
  version?: string,
): Promise<AgreementFieldMap> {
  const { getAgreementTemplateOrThrow } = await import("@/lib/crm/agreement-template-queries");
  const template = await getAgreementTemplateOrThrow(slug, version);
  const pathname = buildAgreementFieldMapPathname(template.slug, template.version);
  const blobBytes = await readBlobFieldMapBytes(pathname);

  if (blobBytes) {
    const raw = new TextDecoder().decode(blobBytes);
    return parseAgreementFieldMap(JSON.parse(raw));
  }

  const bundled = await readBundledAgreementFieldMap(slug);
  if (bundled && bundled.version === template.version) {
    return bundled;
  }

  throw new Error(`No field map found for template: ${slug}`);
}

export async function tryFetchAgreementFieldMap(
  slug: string,
  version?: string,
): Promise<AgreementFieldMap | null> {
  try {
    return await fetchAgreementFieldMap(slug, version);
  } catch {
    return null;
  }
}

export async function saveAgreementFieldMap(fieldMap: AgreementFieldMap): Promise<{
  pathname: string;
  url: string;
}> {
  const privateConfig = getPrivateBlobConfig();
  if (!privateConfig) {
    throw new Error(
      "BLOB_PRIVATE_READ_WRITE_TOKEN is not set. Field maps must use the private Vercel Blob store.",
    );
  }

  const parsed = parseAgreementFieldMap(fieldMap);
  const pathname = buildAgreementFieldMapPathname(parsed.slug, parsed.version);
  const body = `${JSON.stringify(parsed, null, 2)}\n`;

  const result = await put(pathname, body, {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: privateConfig.token,
    storeId: privateConfig.storeId,
  });

  return { pathname, url: result.url };
}

export async function uploadAllBundledFieldMaps(): Promise<
  { slug: string; pathname: string; url: string }[]
> {
  const uploaded: { slug: string; pathname: string; url: string }[] = [];

  for (const slug of Object.keys(BUNDLED_FIELD_MAPS)) {
    const fieldMap = BUNDLED_FIELD_MAPS[slug];
    if (!fieldMap) continue;
    const result = await saveAgreementFieldMap(fieldMap);
    uploaded.push({ slug, pathname: result.pathname, url: result.url });
  }

  return uploaded;
}

export function getAgreementFieldMapPathPrefix(): string {
  return AGREEMENT_FIELD_MAP_PATH_PREFIX;
}
