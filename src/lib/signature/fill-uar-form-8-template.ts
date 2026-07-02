import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  type PDFFont,
  type PDFImage,
  type PDFPage,
  rgb,
} from "pdf-lib";
import type { SignatureMethod } from "@/generated/prisma/client";
import { UAR_FORM_FOOTER } from "@/content/uar-listing-agreement";
import type {
  AgreementFieldMap,
  PdfCheckboxField,
  PdfImageField,
  PdfTextField,
} from "@/lib/signature/agreement-field-map";
import { fetchAgreementFieldMap } from "@/lib/signature/agreement-field-map-storage";
import { hashSignedAgreementPdf } from "@/lib/signature/agreement-audit";
import { fetchAgreementTemplateBytes } from "@/lib/signature/agreement-template-storage";
import type { UarAgreementPdfInput } from "@/lib/signature/uar-agreement-pdf-input";
import type { UarAgreementResolvedValues } from "@/types/uar-agreement";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const ADDENDUM_MARGIN = 50;
const ADDENDUM_WIDTH = PAGE_WIDTH - ADDENDUM_MARGIN * 2;
const BODY_SIZE = 9;
const FOOTER_SIZE = 8;
const LINE_HEIGHT = 12;

export type FillUarForm8TemplateOptions = {
  templateBytes?: Uint8Array;
  fieldMap?: AgreementFieldMap;
  includeDocumentHashOnAddendum?: boolean;
};

function splitTextIntoLines(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLine = words[0] ?? "";

  for (const word of words.slice(1)) {
    const testLine = `${currentLine} ${word}`;
    if (font.widthOfTextAtSize(testLine, size) > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  lines.push(currentLine);
  return lines;
}

function getPage(doc: PDFDocument, pageIndex: number): PDFPage {
  const page = doc.getPage(pageIndex);
  if (!page) {
    throw new Error(`Template is missing page index ${pageIndex}.`);
  }
  return page;
}

function getTextField(fieldMap: AgreementFieldMap, name: string): PdfTextField {
  const field = fieldMap.textFields[name];
  if (!field) {
    throw new Error(`Field map is missing text field: ${name}`);
  }
  return field;
}

function getCheckboxField(fieldMap: AgreementFieldMap, name: string): PdfCheckboxField {
  const field = fieldMap.checkboxFields[name];
  if (!field) {
    throw new Error(`Field map is missing checkbox field: ${name}`);
  }
  return field;
}

function getImageField(fieldMap: AgreementFieldMap, name: string): PdfImageField {
  const field = fieldMap.imageFields[name];
  if (!field) {
    throw new Error(`Field map is missing image field: ${name}`);
  }
  return field;
}

function drawTextField(
  page: PDFPage,
  field: PdfTextField,
  text: string,
  font: PDFFont,
): void {
  const value = text.trim();
  if (!value) return;

  const size = field.size ?? BODY_SIZE;
  const maxWidth = field.maxWidth ?? 200;
  const lines = splitTextIntoLines(value, font, size, maxWidth);

  for (let index = 0; index < lines.length; index += 1) {
    page.drawText(lines[index] ?? "", {
      x: field.x,
      y: field.y - index * (size + 2),
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }
}

function drawCheckbox(
  page: PDFPage,
  field: PdfCheckboxField,
  checked: boolean,
  boldFont: PDFFont,
): void {
  if (!checked) return;

  page.drawText("X", {
    x: field.x,
    y: field.y,
    size: field.size ?? 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
}

function formatSignatureMethod(method: SignatureMethod): string {
  return method === "TYPE" ? "Typed" : "Drawn";
}

async function loadTemplateBytes(options?: FillUarForm8TemplateOptions): Promise<Uint8Array> {
  if (options?.templateBytes) {
    return options.templateBytes;
  }

  try {
    return await fetchAgreementTemplateBytes("uar-exclusive-right-to-sell");
  } catch {
    const localPath = path.join(
      process.cwd(),
      "example-code/pdfs/Exclusive Right to Sell Listing Agreement - UAR.pdf",
    );
    return new Uint8Array(await readFile(localPath));
  }
}

async function loadFieldMap(options?: FillUarForm8TemplateOptions): Promise<AgreementFieldMap> {
  if (options?.fieldMap) {
    return options.fieldMap;
  }

  return fetchAgreementFieldMap("uar-exclusive-right-to-sell");
}

function fillTemplateFields(
  doc: PDFDocument,
  fieldMap: AgreementFieldMap,
  values: UarAgreementResolvedValues,
  font: PDFFont,
  boldFont: PDFFont,
  images: {
    seller1Initials: PDFImage;
    seller1Signature?: PDFImage;
    seller2Initials?: PDFImage;
    seller2Signature?: PDFImage;
  },
): void {
  const text = (name: string) => getTextField(fieldMap, name);
  const checkbox = (name: string) => getCheckboxField(fieldMap, name);
  const image = (name: string) => getImageField(fieldMap, name);

  drawTextField(getPage(doc, text("company").page), text("company"), values.company, font);
  drawTextField(getPage(doc, text("agentName").page), text("agentName"), values.agentName, font);
  drawTextField(
    getPage(doc, text("seller1FullName").page),
    text("seller1FullName"),
    values.seller1FullName,
    font,
  );

  if (values.multipleOwners === "YES" && values.seller2FullName && fieldMap.textFields.seller2FullName) {
    drawTextField(
      getPage(doc, text("seller2FullName").page),
      text("seller2FullName"),
      values.seller2FullName,
      font,
    );
  }

  drawTextField(
    getPage(doc, text("propertyFullAddress").page),
    text("propertyFullAddress"),
    values.propertyFullAddress,
    font,
  );
  drawTextField(
    getPage(doc, text("listingEndDate").page),
    text("listingEndDate"),
    values.listingEndDate,
    font,
  );
  drawTextField(getPage(doc, text("krFeePercent").page), text("krFeePercent"), values.krFeePercent, font);
  drawTextField(getPage(doc, text("krFeeDollar").page), text("krFeeDollar"), values.krFeeDollar, font);
  drawTextField(getPage(doc, text("ubFeePercent").page), text("ubFeePercent"), values.ubFeePercent, font);
  drawTextField(getPage(doc, text("ubFeeDollar").page), text("ubFeeDollar"), values.ubFeeDollar, font);
  drawTextField(
    getPage(doc, text("buyerAgentPercent").page),
    text("buyerAgentPercent"),
    values.buyerAgentPercent,
    font,
  );
  drawTextField(
    getPage(doc, text("buyerAgentDollar").page),
    text("buyerAgentDollar"),
    values.buyerAgentDollar,
    font,
  );
  drawTextField(
    getPage(doc, text("protectionPeriodMonths").page),
    text("protectionPeriodMonths"),
    values.protectionPeriodMonths,
    font,
  );

  const page0 = getPage(doc, 0);
  const page1 = getPage(doc, 1);
  const page2 = getPage(doc, 2);
  const checkboxes = fieldMap.checkboxFields;
  const imageFields = fieldMap.imageFields;

  const drawOptionalCheckbox = (
    page: PDFPage,
    name: string,
    checked: boolean,
  ) => {
    const field = checkboxes[name];
    if (field) {
      drawCheckbox(page, field, checked, boldFont);
    }
  };

  drawOptionalCheckbox(page0, "sellerDeniesBuyerCompAgreement", values.sellerDeniesBuyerCompAgreement);
  drawOptionalCheckbox(page1, "disputeMediationShall", values.disputeMediation === "SHALL");
  drawOptionalCheckbox(
    page1,
    "disputeMediationMay",
    values.disputeMediation === "MAY AT THE OPTION OF THE PARTIES",
  );

  const sqFtSet = new Set(values.sqFtSources);
  drawOptionalCheckbox(page2, "sqFtCountyRecords", sqFtSet.has("County Records"));
  drawOptionalCheckbox(page2, "sqFtAppraisal", sqFtSet.has("Appraisal"));
  drawOptionalCheckbox(page2, "sqFtBuildingPlans", sqFtSet.has("Building Plans"));
  const hasOtherSqFt = sqFtSet.has("Other") || values.sqFtOther.trim().length > 0;
  drawOptionalCheckbox(page2, "sqFtOther", hasOtherSqFt);
  if (values.sqFtOther.trim() && fieldMap.textFields.sqFtOther) {
    drawTextField(
      getPage(doc, fieldMap.textFields.sqFtOther.page),
      fieldMap.textFields.sqFtOther,
      values.sqFtOther,
      font,
    );
  }

  drawOptionalCheckbox(page2, "attachmentAre", values.attachmentTerms === "ARE");
  drawOptionalCheckbox(page2, "attachmentAreNot", values.attachmentTerms === "ARE NOT");
  drawOptionalCheckbox(page2, "firptaIs", values.firptaStatus === "IS");
  drawOptionalCheckbox(page2, "firptaIsNot", values.firptaStatus === "IS NOT");

  for (const name of [
    "page1InitialsDate",
    "page2InitialsDate",
    "page3InitialsDate",
    "page4InitialsDate",
    "seller1SignedDate",
    "agentSignedDate",
  ] as const) {
    const field = fieldMap.textFields[name];
    if (!field) continue;
    const value = name === "agentSignedDate" ? values.agentSignedDate : values.signedDate;
    drawTextField(getPage(doc, field.page), field, value, font);
  }

  if (fieldMap.textFields.agentAcceptanceName) {
    drawTextField(
      getPage(doc, fieldMap.textFields.agentAcceptanceName.page),
      fieldMap.textFields.agentAcceptanceName,
      values.agentName,
      boldFont,
    );
  }

  if (values.multipleOwners === "YES" && fieldMap.textFields.seller2SignedDate) {
    drawTextField(
      getPage(doc, fieldMap.textFields.seller2SignedDate.page),
      fieldMap.textFields.seller2SignedDate,
      values.signedDate,
      font,
    );
  }

  if (fieldMap.textFields.seller1AddressPhone && values.seller1AddressPhone) {
    drawTextField(
      getPage(doc, fieldMap.textFields.seller1AddressPhone.page),
      fieldMap.textFields.seller1AddressPhone,
      values.seller1AddressPhone,
      font,
    );
  }

  if (
    values.multipleOwners === "YES" &&
    fieldMap.textFields.seller2AddressPhone &&
    values.seller2AddressPhone
  ) {
    drawTextField(
      getPage(doc, fieldMap.textFields.seller2AddressPhone.page),
      fieldMap.textFields.seller2AddressPhone,
      values.seller2AddressPhone,
      font,
    );
  }

  const stampInitials = (pageIndex: number, field: PdfImageField) => {
    getPage(doc, pageIndex).drawImage(images.seller1Initials, {
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
    });
  };

  for (const name of ["page1Initials", "page2Initials", "page3Initials", "page4Initials"] as const) {
    const field = imageFields[name];
    if (field) {
      stampInitials(field.page, field);
    }
  }

  if (images.seller1Signature && imageFields.seller1Signature) {
    getPage(doc, imageFields.seller1Signature.page).drawImage(images.seller1Signature, {
      x: imageFields.seller1Signature.x,
      y: imageFields.seller1Signature.y,
      width: imageFields.seller1Signature.width,
      height: imageFields.seller1Signature.height,
    });
    if (imageFields.seller1InitialsOnPage4) {
      getPage(doc, imageFields.seller1InitialsOnPage4.page).drawImage(images.seller1Initials, {
        x: imageFields.seller1InitialsOnPage4.x,
        y: imageFields.seller1InitialsOnPage4.y,
        width: imageFields.seller1InitialsOnPage4.width,
        height: imageFields.seller1InitialsOnPage4.height,
      });
    }
  }

  if (images.seller2Signature && images.seller2Initials && imageFields.seller2Signature) {
    getPage(doc, imageFields.seller2Signature.page).drawImage(images.seller2Signature, {
      x: imageFields.seller2Signature.x,
      y: imageFields.seller2Signature.y,
      width: imageFields.seller2Signature.width,
      height: imageFields.seller2Signature.height,
    });
    if (imageFields.seller2InitialsOnPage4) {
      getPage(doc, imageFields.seller2InitialsOnPage4.page).drawImage(images.seller2Initials, {
        x: imageFields.seller2InitialsOnPage4.x,
        y: imageFields.seller2InitialsOnPage4.y,
        width: imageFields.seller2InitialsOnPage4.width,
        height: imageFields.seller2InitialsOnPage4.height,
      });
    }
  }
}

function drawAddendumPage(
  doc: PDFDocument,
  input: UarAgreementPdfInput,
  font: PDFFont,
  boldFont: PDFFont,
  includeDocumentHash: boolean,
): void {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - ADDENDUM_MARGIN;

  const drawHeading = (text: string) => {
    page.drawText(text, { x: ADDENDUM_MARGIN, y, size: 11, font: boldFont });
    y -= LINE_HEIGHT + 4;
  };

  const drawBody = (text: string, size = BODY_SIZE) => {
    const lines = splitTextIntoLines(text, font, size, ADDENDUM_WIDTH);
    for (const line of lines) {
      if (y < ADDENDUM_MARGIN) break;
      page.drawText(line, { x: ADDENDUM_MARGIN, y, size, font });
      y -= LINE_HEIGHT;
    }
    y -= 6;
  };

  drawHeading("ADDENDUM — CANCELLATION OF THIS AGREEMENT");
  drawBody("17. CANCELLATION OF THIS AGREEMENT:");
  drawBody(input.values.cancellationTerms);

  y -= 8;
  drawHeading("ELECTRONIC SIGNATURE AUDIT RECORD");

  const auditLines = [
    `Signed electronically by ${input.audit.signerName} (${input.audit.signerEmail})`,
    `Signature method: ${formatSignatureMethod(input.audit.signatureMethod)}`,
    `Agreement version: ${input.audit.agreementVersion}`,
    `Signed at (UTC): ${input.audit.signedAt.toISOString()}`,
    UAR_FORM_FOOTER,
  ];

  if (includeDocumentHash && input.audit.agreementHash) {
    auditLines.splice(3, 0, `Document hash: ${input.audit.agreementHash}`);
  }

  if (input.audit.ipAddress) {
    auditLines.push(`IP address: ${input.audit.ipAddress}`);
  }
  if (input.audit.userAgent) {
    auditLines.push(`User agent: ${input.audit.userAgent}`);
  }

  for (const line of auditLines) {
    drawBody(line, FOOTER_SIZE);
  }
}

export async function fillUarForm8TemplatePdf(
  input: UarAgreementPdfInput,
  options?: FillUarForm8TemplateOptions,
): Promise<Uint8Array> {
  const [templateBytes, fieldMap] = await Promise.all([
    loadTemplateBytes(options),
    loadFieldMap(options),
  ]);
  const doc = await PDFDocument.load(templateBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const seller1Initials = await doc.embedPng(input.seller1InitialsPngBytes);
  const seller1Signature = await doc.embedPng(input.seller1SignaturePngBytes);
  const seller2Initials =
    input.seller2InitialsPngBytes != null
      ? await doc.embedPng(input.seller2InitialsPngBytes)
      : undefined;
  const seller2Signature =
    input.seller2SignaturePngBytes != null
      ? await doc.embedPng(input.seller2SignaturePngBytes)
      : undefined;

  fillTemplateFields(doc, fieldMap, input.values, font, boldFont, {
    seller1Initials,
    seller1Signature,
    seller2Initials,
    seller2Signature,
  });

  drawAddendumPage(
    doc,
    input,
    font,
    boldFont,
    options?.includeDocumentHashOnAddendum ?? false,
  );

  return doc.save();
}

export async function generateFinalUarForm8Pdf(
  input: UarAgreementPdfInput,
  options?: Omit<FillUarForm8TemplateOptions, "includeDocumentHashOnAddendum">,
): Promise<{ pdfBytes: Uint8Array; documentHash: string }> {
  const passOneBytes = await fillUarForm8TemplatePdf(input, {
    ...options,
    includeDocumentHashOnAddendum: false,
  });
  const documentHash = hashSignedAgreementPdf(passOneBytes);

  const pdfBytes = await fillUarForm8TemplatePdf(
    {
      ...input,
      audit: {
        ...input.audit,
        agreementHash: documentHash,
      },
    },
    {
      ...options,
      includeDocumentHashOnAddendum: true,
    },
  );

  return {
    pdfBytes,
    documentHash: hashSignedAgreementPdf(pdfBytes),
  };
}

// Re-export helpers used by tests and preview tooling.
export {
  getCheckboxField,
  getImageField,
  getTextField,
};
