import { NextResponse } from "next/server";
import { parseAgreementFieldMap } from "@/lib/signature/agreement-field-map";
import {
  fetchAgreementTemplateBytes,
  readLocalAgreementTemplateBytes,
} from "@/lib/signature/agreement-template-storage";
import { generateFieldMapDebugPdf } from "@/lib/signature/draw-field-map-debug-overlay";
import { fillUarForm8TemplatePdf } from "@/lib/signature/fill-uar-form-8-template";
import { fillDataFormResidentialPdf } from "@/lib/signature/fill-uar-data-form-residential";
import { resolveDataFormValues } from "@/lib/signature/resolve-data-form-values";
import {
  buildUarAgreementPreviewInput,
  MINIMAL_PNG,
} from "@/lib/signature/uar-agreement-preview-fixture";
import { resolveAgreementTemplateFromRequest } from "@/lib/crm/agreement-template-api";
import {
  isUarDataFormResidentialSlug,
  isUarExclusiveRightToSellSlug,
} from "@/lib/crm/agreement-template-queries";
import { requireAgreementTemplateAdmin } from "@/lib/crm/agreement-template-admin";
import type { FullMlsInputValues } from "@/lib/mls-input/validation";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function buildDataFormPreviewIntake(): FullMlsInputValues {
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
    listingQuadrant: "NE",
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
      "School District": { name: "Granite School District" },
      "Elementary School": { name: "Whittier Elementary" },
      "Junior High/Middle School": { name: "Bryant Middle" },
      "High School": { name: "East High" },
    },
    hoa: "No",
    hoaFeeMonth: "0",
    hoaFeeFrequency: "Monthly",
    shortTermRentals: "No",
    projectRestriction: "No",
    seniorCommunity: "No",
    maintenanceFree: "No",
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
    levelCount: "2",
    "q26-typea26": ["Full"],
    basementFinished: "Partial",
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
    "q35-connectedutilities": ["Natural Gas", "Power", "Sewer"],
    "q44-water": ["Culinary"],
    "q45-telecommunications": ["Fiber"],
    "q38-zoning": ["Single-Family"],
    "q40-typea40": ["Cash", "Conventional Loan"],
    "q191-propertyoccupancy": "Owner Occupied",
    "q97-publicremarks": "Preview fill for Data Form field mapper.",
    "q20-signature": "https://example.com/signature.png",
    "q20-initials": "https://example.com/initials.png",
    "q23-signature23": "",
    "q23-initials": "",
  } as FullMlsInputValues;
}

export async function POST(request: Request, context: RouteContext) {
  const { response } = await requireAgreementTemplateAdmin();
  if (response) return response;

  const { slug: rawSlug } = await context.params;
  const { template, response: templateResponse } = await resolveAgreementTemplateFromRequest(
    rawSlug,
    request,
  );
  if (templateResponse) return templateResponse;

  let body: { fieldMap?: unknown; mode?: "debug" | "fill" } = {};
  try {
    body = (await request.json()) as { fieldMap?: unknown; mode?: "debug" | "fill" };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.fieldMap) {
    return NextResponse.json({ error: "fieldMap is required." }, { status: 400 });
  }

  let fieldMap;
  try {
    fieldMap = parseAgreementFieldMap(body.fieldMap);
    if (fieldMap.slug !== template.slug) {
      return NextResponse.json({ error: "Field map slug does not match URL." }, { status: 400 });
    }
    if (fieldMap.version !== template.version) {
      return NextResponse.json(
        { error: `Field map version must be ${template.version}.` },
        { status: 400 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid field map.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let templateBytes: Uint8Array;
  try {
    templateBytes = await fetchAgreementTemplateBytes(template.slug, template.version);
  } catch {
    if (template.localFilename) {
      try {
        templateBytes = await readLocalAgreementTemplateBytes({
          localFilename: template.localFilename,
        });
      } catch {
        return NextResponse.json({ error: "Template PDF not found." }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Template PDF not found." }, { status: 404 });
    }
  }

  const mode = body.mode ?? "debug";
  let pdfBytes: Uint8Array;

  if (mode === "fill" && isUarExclusiveRightToSellSlug(template.slug)) {
    pdfBytes = await fillUarForm8TemplatePdf(buildUarAgreementPreviewInput(), {
      templateBytes,
      fieldMap,
      includeDocumentHashOnAddendum: false,
    });
  } else if (mode === "fill" && isUarDataFormResidentialSlug(template.slug)) {
    const resolvedValues = resolveDataFormValues(buildDataFormPreviewIntake(), {
      signedDate: "07/14/2026",
    });
    pdfBytes = await fillDataFormResidentialPdf(resolvedValues, {
      templateBytes,
      fieldMap,
      imageBytesByField: {
        owner1Signature: MINIMAL_PNG,
        page0Initials: MINIMAL_PNG,
        page1Initials: MINIMAL_PNG,
        page2Initials: MINIMAL_PNG,
        page3Initials: MINIMAL_PNG,
        page4Initials: MINIMAL_PNG,
        page5Initials: MINIMAL_PNG,
      },
    });
  } else {
    pdfBytes = await generateFieldMapDebugPdf(templateBytes, fieldMap);
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${template.slug}-preview.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
