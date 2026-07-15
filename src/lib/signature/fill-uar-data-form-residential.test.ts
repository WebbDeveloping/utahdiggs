import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { PDFDocument } from "pdf-lib";
import { readBundledAgreementFieldMap } from "@/lib/signature/agreement-field-map-storage";
import {
  fillDataFormResidentialPdf,
  generateDataFormPdf,
} from "@/lib/signature/fill-uar-data-form-residential";
import { resolveDataFormValues } from "@/lib/signature/resolve-data-form-values";
import { MINIMAL_PNG } from "@/lib/signature/uar-agreement-preview-fixture";
import type { FullMlsInputValues } from "@/lib/mls-input/validation";

async function loadLocalTemplateBytes(): Promise<Uint8Array> {
  const templatePath = path.join(
    process.cwd(),
    "example-code/pdfs/Data Form - Residential - URE.pdf",
  );
  return new Uint8Array(await readFile(templatePath));
}

async function loadBundledFieldMap() {
  const fieldMap = await readBundledAgreementFieldMap("uar-data-form-residential");
  if (!fieldMap) {
    throw new Error("Bundled Data Form field map not found.");
  }
  return fieldMap;
}

function signatureAndInitialsBytes(): Record<string, Uint8Array> {
  const bytes: Record<string, Uint8Array> = {
    owner1Signature: MINIMAL_PNG,
  };
  for (const page of [0, 1, 2, 3, 4, 5]) {
    bytes[`page${page}Initials`] = MINIMAL_PNG;
  }
  return bytes;
}

function buildFixtureIntake(): FullMlsInputValues {
  return {
    ownerCount: "One",
    primaryOwnerName: { first: "Jane", last: "Seller" },
    primaryOwnerPhone: "8015551234",
    primaryOwnerEmail: "jane@example.com",
    secondaryOwnerName: { first: "John", last: "Seller" },
    secondaryOwnerPhone: "8015559999",
    secondaryOwnerEmail: "john@example.com",
    listingAddress: {
      street: "123 Main Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    listingCounty: "Salt Lake",
    nonStandardAddress: "No",
    directionsRemarks: "n/a",
    ownerAddressSameAsListing: "Yes",
    ownerAddress: {
      street: "123 Main Street",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    listingPrice: "525000",
    shortSale: "Not Short Sale",
    schools: {
      "School District": { name: "Granite" },
      "Elementary School": { name: "Whittier" },
      "Junior High/Middle School": { name: "Bryant" },
      "High School": { name: "East" },
    },
    hoa: "No",
    hoaFeeMonth: "0",
    hoaFeeFrequency: "Monthly",
    solar: "No",
    solarOwnership: "Owned",
    solarYearInstalled: "",
    "q11-propertytype": "Single Family",
    constructionStatus: "Built/Standing",
    "q51-styleof51": "2-Story",
    yearBuilt: "1998",
    noAssignedParcelNumber: "No",
    taxParcelNumber: "12-34-56-789",
    pud: "No",
    pid: "No",
    lotSize: "0.18",
    livingSqft: "2400",
    adu: "No",
    aduType: "Attached",
    aduKitchen: "Yes",
    aduSeparateEntrance: "Yes",
    aduSeparateWaterMeter: "No",
    aduSeparateGasMeter: "No",
    aduSeparateElectricMeter: "No",
    aduCurrentlyRented: "No",
    aduMonthlyRent: "0",
    levelCount: "1",
    "q26-typea26": ["Full"],
    basementFinished: "N/A",
    "q33-flooring": ["Hardwood"],
    "q27-typea27": ["None"],
    "q41-window-coverings": ["Blinds"],
    "q31-airconditioning": ["Central Air; Gas"],
    "q96-hvac96": ["Forced Air"],
    "q32-typea32": ["Stucco"],
    "q30-typea30": ["Attached"],
    "q28-typea28": ["Concrete"],
    "q184-doesthe": "No",
    "q63-pooltype": ["None"],
    "q37-typea37": ["Asphalt Shingles"],
    "q36-typea36": ["Full Landscaping"],
    "q43-lot-facts": ["Curb & Gutter"],
    petsAllowed: "No",
    "q47-animals": [],
    "q39-typea39": ["Garage"],
    "q35-connectedutilities": ["Natural Gas"],
    "q44-water": ["Culinary"],
    "q45-telecommunications": ["Fiber"],
    "q38-zoning": ["Single-Family"],
    "q40-typea40": ["Cash"],
    "q191-propertyoccupancy": "Owner Occupied",
    "q20-signature": "https://example.com/signature.png",
    "q20-initials": "https://example.com/initials.png",
    "q23-signature23": "",
    "q23-initials": "",
  } as FullMlsInputValues;
}

describe("fillDataFormResidentialPdf", () => {
  it("returns valid PDF bytes with six template pages", async () => {
    const [templateBytes, fieldMap] = await Promise.all([
      loadLocalTemplateBytes(),
      loadBundledFieldMap(),
    ]);
    const resolved = resolveDataFormValues(buildFixtureIntake(), { signedDate: "07/14/2026" });
    const pdfBytes = await fillDataFormResidentialPdf(resolved, {
      templateBytes,
      fieldMap,
      imageBytesByField: signatureAndInitialsBytes(),
    });
    const header = new TextDecoder().decode(pdfBytes.slice(0, 4));
    const doc = await PDFDocument.load(pdfBytes);

    assert.equal(header, "%PDF");
    assert.ok(pdfBytes.length > 10_000);
    assert.equal(doc.getPageCount(), 6);
  });
});

describe("generateDataFormPdf", () => {
  it("resolves intake values and produces PDF bytes", async () => {
    const [templateBytes, fieldMap] = await Promise.all([
      loadLocalTemplateBytes(),
      loadBundledFieldMap(),
    ]);
    const { pdfBytes, resolvedValues } = await generateDataFormPdf(buildFixtureIntake(), {
      templateBytes,
      fieldMap,
      imageBytesByField: signatureAndInitialsBytes(),
    });

    assert.equal(resolvedValues.text.listPrice, "525000");
    assert.equal(resolvedValues.text.city, "Salt Lake City");
    assert.ok(pdfBytes.length > 10_000);
  });
});
