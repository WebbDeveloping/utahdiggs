import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { PDFDocument } from "pdf-lib";
import { hashSignedAgreementPdf } from "@/lib/signature/agreement-audit";
import {
  fillUarForm8TemplatePdf,
  generateFinalUarForm8Pdf,
} from "@/lib/signature/fill-uar-form-8-template";
import { readBundledAgreementFieldMap } from "@/lib/signature/agreement-field-map-storage";
import { buildUarAgreementPreviewInput } from "@/lib/signature/uar-agreement-preview-fixture";

async function loadLocalTemplateBytes(): Promise<Uint8Array> {
  const templatePath = path.join(
    process.cwd(),
    "example-code/pdfs/Exclusive Right to Sell Listing Agreement - UAR.pdf",
  );
  return new Uint8Array(await readFile(templatePath));
}

function buildFixtureInput() {
  return buildUarAgreementPreviewInput();
}

async function loadBundledFieldMap() {
  const fieldMap = await readBundledAgreementFieldMap("uar-exclusive-right-to-sell");
  if (!fieldMap) {
    throw new Error("Bundled UAR field map not found.");
  }
  return fieldMap;
}

describe("fillUarForm8TemplatePdf", () => {
  it("returns valid PDF bytes with embedded content", async () => {
    const [templateBytes, fieldMap] = await Promise.all([
      loadLocalTemplateBytes(),
      loadBundledFieldMap(),
    ]);
    const pdfBytes = await fillUarForm8TemplatePdf(buildFixtureInput(), {
      templateBytes,
      fieldMap,
    });
    const header = new TextDecoder().decode(pdfBytes.slice(0, 4));

    assert.equal(header, "%PDF");
    assert.ok(pdfBytes.length > 10_000);
  });

  it("produces five pages including the addendum", async () => {
    const [templateBytes, fieldMap] = await Promise.all([
      loadLocalTemplateBytes(),
      loadBundledFieldMap(),
    ]);
    const pdfBytes = await fillUarForm8TemplatePdf(buildFixtureInput(), {
      templateBytes,
      fieldMap,
    });
    const doc = await PDFDocument.load(pdfBytes);

    assert.equal(doc.getPageCount(), 5);
  });

  it("produces stable output for the same input", async () => {
    const [templateBytes, fieldMap] = await Promise.all([
      loadLocalTemplateBytes(),
      loadBundledFieldMap(),
    ]);
    const input = buildFixtureInput();
    const first = await fillUarForm8TemplatePdf(input, { templateBytes, fieldMap });
    const second = await fillUarForm8TemplatePdf(input, { templateBytes, fieldMap });

    assert.equal(
      createHash("sha256").update(first).digest("hex"),
      createHash("sha256").update(second).digest("hex"),
    );
  });
});

describe("generateFinalUarForm8Pdf", () => {
  it("returns a document hash matching the final PDF bytes", async () => {
    const [templateBytes, fieldMap] = await Promise.all([
      loadLocalTemplateBytes(),
      loadBundledFieldMap(),
    ]);
    const { pdfBytes, documentHash } = await generateFinalUarForm8Pdf(buildFixtureInput(), {
      templateBytes,
      fieldMap,
    });

    assert.equal(documentHash, hashSignedAgreementPdf(pdfBytes));
    assert.match(documentHash, /^[a-f0-9]{64}$/);
  });
});
