import { config as loadEnv } from "dotenv";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { uploadAllAgreementTemplates } from "../src/lib/signature/agreement-template-storage";
import { uploadAllBundledFieldMaps } from "../src/lib/signature/agreement-field-map-storage";

loadEnv({ path: ".env.local", override: true });
loadEnv();

const MANIFEST_PATH = path.join(
  process.cwd(),
  "src/lib/signature/agreement-templates.manifest.json",
);

async function main() {
  const manifest = await uploadAllAgreementTemplates();
  const fieldMaps = await uploadAllBundledFieldMaps();

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log("Uploaded agreement templates to private Vercel Blob:\n");
  for (const template of manifest.templates) {
    console.log(`- ${template.displayName}`);
    console.log(`  slug: ${template.slug}`);
    console.log(`  pathname: ${template.pathname}`);
    console.log(`  sha256: ${template.contentHash}`);
    console.log(`  bytes: ${template.byteSize}`);
    console.log("");
  }

  if (fieldMaps.length > 0) {
    console.log("Uploaded agreement field maps:\n");
    for (const fieldMap of fieldMaps) {
      console.log(`- ${fieldMap.slug}`);
      console.log(`  pathname: ${fieldMap.pathname}`);
      console.log("");
    }
  }

  console.log(`Manifest written to ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
