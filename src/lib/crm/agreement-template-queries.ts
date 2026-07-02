import {
  buildAgreementFieldMapPathname,
  parseAgreementFieldMap,
  type AgreementFieldMap,
} from "@/lib/signature/agreement-field-map";
import {
  readBundledAgreementFieldMap,
  readBlobFieldMapBytes,
} from "@/lib/signature/agreement-field-map-storage";
import {
  AGREEMENT_TEMPLATE_DEFINITIONS,
  buildAgreementTemplatePathname,
  UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG,
} from "@/lib/signature/agreement-template-definitions";
import manifest from "@/lib/signature/agreement-templates.manifest.json";

export type AgreementTemplateRecord = {
  id: string;
  slug: string;
  version: string;
  displayName: string;
  revisionLabel: string | null;
  blobPathname: string;
  localFilename: string | null;
  contentHash: string | null;
  byteSize: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AgreementTemplateFieldMapStatus = "none" | "blob" | "bundled";

export type AgreementTemplateListItem = AgreementTemplateRecord & {
  fieldMapStatus: AgreementTemplateFieldMapStatus;
};

function legacyTemplateRecord(
  slug: string,
  version?: string,
): AgreementTemplateRecord | null {
  const definition = AGREEMENT_TEMPLATE_DEFINITIONS.find(
    (entry) =>
      entry.slug === slug && (version === undefined || entry.version === version),
  );
  if (!definition) {
    return null;
  }

  const uploaded = manifest.templates.find((entry) => entry.slug === definition.slug);
  const now = new Date(0);

  return {
    id: `legacy_${definition.slug}`,
    slug: definition.slug,
    version: definition.version,
    displayName: definition.displayName,
    revisionLabel: definition.revisionLabel,
    blobPathname: buildAgreementTemplatePathname(definition.blobFilename),
    localFilename: definition.localFilename,
    contentHash: uploaded?.contentHash ?? null,
    byteSize: uploaded?.byteSize ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

async function getPrismaClient() {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

export async function listAgreementTemplates(): Promise<AgreementTemplateRecord[]> {
  try {
    const prisma = await getPrismaClient();
    return prisma.agreementTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ slug: "asc" }, { version: "desc" }],
    });
  } catch {
    return AGREEMENT_TEMPLATE_DEFINITIONS.map(
      (definition) => legacyTemplateRecord(definition.slug, definition.version)!,
    );
  }
}

export async function listAgreementTemplatesWithFieldMapStatus(): Promise<
  AgreementTemplateListItem[]
> {
  const templates = await listAgreementTemplates();
  const items = await Promise.all(
    templates.map(async (template) => ({
      ...template,
      fieldMapStatus: await getAgreementTemplateFieldMapStatus(template.slug, template.version),
    })),
  );
  return items;
}

export async function getAgreementTemplate(
  slug: string,
  version?: string,
): Promise<AgreementTemplateRecord | null> {
  try {
    const prisma = await getPrismaClient();

    if (version) {
      return prisma.agreementTemplate.findUnique({
        where: { slug_version: { slug, version } },
      });
    }

    return prisma.agreementTemplate.findFirst({
      where: { slug, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return legacyTemplateRecord(slug, version) ?? legacyTemplateRecord(slug);
  }
}

export async function getAgreementTemplateOrThrow(
  slug: string,
  version?: string,
): Promise<AgreementTemplateRecord> {
  const template = await getAgreementTemplate(slug, version);
  if (!template) {
    throw new Error(`Unknown agreement template: ${slug}`);
  }
  return template;
}

export async function agreementTemplateExists(
  slug: string,
  version: string,
): Promise<boolean> {
  try {
    const prisma = await getPrismaClient();
    const existing = await prisma.agreementTemplate.findUnique({
      where: { slug_version: { slug, version } },
      select: { id: true },
    });
    return existing !== null;
  } catch {
    return legacyTemplateRecord(slug, version) !== null;
  }
}

export async function createAgreementTemplate(input: {
  slug: string;
  version: string;
  displayName: string;
  revisionLabel?: string | null;
  blobPathname: string;
  localFilename?: string | null;
  contentHash: string;
  byteSize: number;
}): Promise<AgreementTemplateRecord> {
  const prisma = await getPrismaClient();
  return prisma.agreementTemplate.create({
    data: {
      slug: input.slug,
      version: input.version,
      displayName: input.displayName,
      revisionLabel: input.revisionLabel ?? null,
      blobPathname: input.blobPathname,
      localFilename: input.localFilename ?? null,
      contentHash: input.contentHash,
      byteSize: input.byteSize,
    },
  });
}

async function readFieldMapFromBlob(
  slug: string,
  version: string,
): Promise<AgreementFieldMap | null> {
  const pathname = buildAgreementFieldMapPathname(slug, version);
  const blobBytes = await readBlobFieldMapBytes(pathname);
  if (!blobBytes) {
    return null;
  }

  const raw = new TextDecoder().decode(blobBytes);
  return parseAgreementFieldMap(JSON.parse(raw));
}

export async function getAgreementTemplateFieldMapStatus(
  slug: string,
  version: string,
): Promise<AgreementTemplateFieldMapStatus> {
  const blobMap = await readFieldMapFromBlob(slug, version);
  if (blobMap) {
    const bundled = await readBundledAgreementFieldMap(slug);
    if (bundled && JSON.stringify(bundled) === JSON.stringify(blobMap)) {
      return "bundled";
    }
    return "blob";
  }

  const bundled = await readBundledAgreementFieldMap(slug);
  if (bundled && bundled.version === version) {
    return "bundled";
  }

  return "none";
}

export async function resolveFieldMapSource(
  slug: string,
  version: string,
  fieldMap: AgreementFieldMap,
): Promise<"bundled" | "blob"> {
  const bundled = await readBundledAgreementFieldMap(slug);
  if (bundled && JSON.stringify(bundled) === JSON.stringify(fieldMap)) {
    return "bundled";
  }
  return "blob";
}

/** Production signing uses this slug; kept explicit for type narrowing at call sites. */
export function isUarExclusiveRightToSellSlug(
  slug: string,
): slug is typeof UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG {
  return slug === UAR_EXCLUSIVE_RIGHT_TO_SELL_SLUG;
}
