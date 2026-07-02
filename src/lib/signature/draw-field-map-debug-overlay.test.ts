import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { PDFDocument } from "pdf-lib";
import { parseAgreementFieldMap } from "@/lib/signature/agreement-field-map";
import { generateFieldMapDebugPdf } from "@/lib/signature/draw-field-map-debug-overlay";
import uarExclusiveRightToSellFieldMap from "@/lib/signature/field-maps/uar-exclusive-right-to-sell-2024-11-05.json";

async function loadLocalTemplateBytes(): Promise<Uint8Array> {
  const templatePath = path.join(
    process.cwd(),
    "example-code/pdfs/Exclusive Right to Sell Listing Agreement - UAR.pdf",
  );
  return new Uint8Array(await readFile(templatePath));
}

describe("generateFieldMapDebugPdf", () => {
  it("returns a four-page PDF with debug overlays", async () => {
    const templateBytes = await loadLocalTemplateBytes();
    const fieldMap = parseAgreementFieldMap(uarExclusiveRightToSellFieldMap);
    const pdfBytes = await generateFieldMapDebugPdf(templateBytes, fieldMap);
    const doc = await PDFDocument.load(pdfBytes);

    assert.equal(new TextDecoder().decode(pdfBytes.slice(0, 4)), "%PDF");
    assert.equal(doc.getPageCount(), 4);
  });
});
