import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv();

async function main() {
  const { AGREEMENT_TEMPLATE_DEFINITIONS } = await import(
    "../src/lib/signature/agreement-template-definitions"
  );
  const manifest = (await import("../src/lib/signature/agreement-templates.manifest.json")).default;
  const { prisma } = await import("../src/lib/db");

  for (const definition of AGREEMENT_TEMPLATE_DEFINITIONS) {
    const uploaded = manifest.templates.find((entry) => entry.slug === definition.slug);
    if (!uploaded) {
      console.warn(`No manifest entry for ${definition.slug}; skipping.`);
      continue;
    }

    await prisma.agreementTemplate.upsert({
      where: {
        slug_version: {
          slug: definition.slug,
          version: definition.version,
        },
      },
      create: {
        id: `seed_${definition.slug.replace(/-/g, "_")}`,
        slug: definition.slug,
        version: definition.version,
        displayName: definition.displayName,
        revisionLabel: definition.revisionLabel,
        blobPathname: uploaded.pathname,
        localFilename: definition.localFilename,
        contentHash: uploaded.contentHash,
        byteSize: uploaded.byteSize,
        isActive: true,
      },
      update: {
        displayName: definition.displayName,
        revisionLabel: definition.revisionLabel,
        blobPathname: uploaded.pathname,
        localFilename: definition.localFilename,
        contentHash: uploaded.contentHash,
        byteSize: uploaded.byteSize,
        isActive: true,
      },
    });

    console.log(`Seeded ${definition.slug} (${definition.version})`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
