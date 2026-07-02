import { config as loadEnv } from "dotenv";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchAgreementFieldMap } from "../src/lib/signature/agreement-field-map-storage";
import { generateFieldMapDebugPdf } from "../src/lib/signature/draw-field-map-debug-overlay";

loadEnv({ path: ".env.local", override: true });
loadEnv();

const OUTPUT_PATH =
  process.env.UAR_FORM_8_DEBUG_OUTPUT ??
  path.join(process.cwd(), "tmp", "uar-form-8-field-map-debug.pdf");

async function main() {
  const templatePath = path.join(
    process.cwd(),
    "example-code/pdfs/Exclusive Right to Sell Listing Agreement - UAR.pdf",
  );
  const templateBytes = new Uint8Array(await readFile(templatePath));
  const fieldMap = await fetchAgreementFieldMap("uar-exclusive-right-to-sell");
  const output = await generateFieldMapDebugPdf(templateBytes, fieldMap);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, output);
  console.log(`Wrote coordinate debug PDF to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
