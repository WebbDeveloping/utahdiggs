import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { PDFDocument } from "pdf-lib";
import { readBundledAgreementFieldMap } from "@/lib/signature/agreement-field-map-storage";
import {
  buildDataFormPreviewPdf,
  coerceMlsPreviewValues,
} from "@/lib/signature/build-data-form-preview-pdf";
import { fillDataFormResidentialPdf } from "@/lib/signature/fill-uar-data-form-residential";
import { resolveDataFormValues } from "@/lib/signature/resolve-data-form-values";

async function loadLocalTemplateBytes(): Promise<Uint8Array> {
  const templatePath = path.join(
    process.cwd(),
    "example-code/pdfs/Data Form - Residential - URE.pdf",
  );
  return new Uint8Array(await readFile(templatePath));
}

describe("buildDataFormPreviewPdf", () => {
  it("coerces incomplete draft values without requiring full MLS validation", () => {
    const draft = {
      listingAddress: {
        street: "123 Preview St",
        city: "Salt Lake City",
        state: "UT",
        zip: "84101",
      },
      listingPrice: "450000",
      "q11-propertytype": "Single Family",
    };

    const coerced = coerceMlsPreviewValues(draft);
    assert.equal(coerced.listingPrice, "450000");
    assert.equal(coerced["q11-propertytype"], "Single Family");
  });

  it("maps live wizard selections into resolved Data Form fields (not CRM fixtures)", () => {
    const draft = {
      listingAddress: {
        street: "456 Maple Ave",
        city: "Provo",
        state: "UT",
        zip: "84604",
      },
      listingPrice: "525000",
      listingCounty: "Utah",
      primaryOwnerName: { first: "Alex", last: "Preview" },
      "q11-propertytype": "Townhouse",
      "q12-style": ["2-Story"],
    };

    const resolved = resolveDataFormValues(coerceMlsPreviewValues(draft));
    assert.match(resolved.text.listPrice ?? "", /525/);
    assert.match(resolved.text.city ?? "", /Provo/i);
    assert.match(resolved.text.ownerName ?? "", /Alex/);
    assert.equal(resolved.checkboxes["propertyType_Townhouse"], true);
    assert.notEqual(resolved.text.streetName, "Fixture Street");
  });

  it("generates a multi-page PDF for draft values via the same fill pipeline", async () => {
    const fieldMap = await readBundledAgreementFieldMap("uar-data-form-residential");
    assert.ok(fieldMap);

    const draft = {
      listingAddress: {
        street: "789 Preview Lane",
        city: "Lehi",
        state: "UT",
        zip: "84043",
      },
      listingPrice: "610000",
      listingCounty: "Utah",
      primaryOwnerName: { first: "Sam", last: "Seller" },
      "q11-propertytype": "Single Family",
    };

    const resolved = resolveDataFormValues(coerceMlsPreviewValues(draft));
    const pdfBytes = await fillDataFormResidentialPdf(resolved, {
      templateBytes: await loadLocalTemplateBytes(),
      fieldMap,
    });

    assert.ok(pdfBytes.byteLength > 1000);
    const doc = await PDFDocument.load(pdfBytes);
    assert.ok(doc.getPageCount() >= 5);
  });

  it("buildDataFormPreviewPdf returns PDF bytes (template + field map from storage/fallback)", async () => {
    const pdfBytes = await buildDataFormPreviewPdf({
      listingAddress: {
        street: "100 Live Values Rd",
        city: "Draper",
        state: "UT",
        zip: "84020",
      },
      listingPrice: "699000",
      listingCounty: "Salt Lake",
      primaryOwnerName: { first: "Jordan", last: "Owner" },
      "q11-propertytype": "Single Family",
    });

    assert.ok(pdfBytes.byteLength > 1000);
    const doc = await PDFDocument.load(pdfBytes);
    assert.ok(doc.getPageCount() >= 5);
  });
});
