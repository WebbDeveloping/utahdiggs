import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, type PDFFont, type PDFPage, rgb } from "pdf-lib";
import type {
  AgreementFieldMap,
  PdfCheckboxField,
  PdfTextField,
} from "@/lib/signature/agreement-field-map";
import { fetchAgreementFieldMap } from "@/lib/signature/agreement-field-map-storage";
import { fetchAgreementTemplateBytes } from "@/lib/signature/agreement-template-storage";
import { UAR_DATA_FORM_RESIDENTIAL_SLUG } from "@/lib/signature/agreement-template-definitions";
import {
  resolveDataFormValues,
  type DataFormResolvedValues,
} from "@/lib/signature/resolve-data-form-values";
import { fetchSignatureImageBytes } from "@/lib/signature/signed-document-storage";
import type { FullMlsInputValues } from "@/lib/mls-input/validation";

const BODY_SIZE = 8;

export type FillDataFormTemplateOptions = {
  templateBytes?: Uint8Array;
  fieldMap?: AgreementFieldMap;
  resolvedValues?: DataFormResolvedValues;
  /** Injected image bytes keyed by image field name (skips URL fetch). */
  imageBytesByField?: Record<string, Uint8Array>;
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

function drawTextField(page: PDFPage, field: PdfTextField, text: string, font: PDFFont): void {
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

async function loadTemplateBytes(options?: FillDataFormTemplateOptions): Promise<Uint8Array> {
  if (options?.templateBytes) {
    return options.templateBytes;
  }

  try {
    return await fetchAgreementTemplateBytes(UAR_DATA_FORM_RESIDENTIAL_SLUG);
  } catch {
    const localPath = path.join(
      process.cwd(),
      "example-code/pdfs/Data Form - Residential - URE.pdf",
    );
    return new Uint8Array(await readFile(localPath));
  }
}

async function loadFieldMap(options?: FillDataFormTemplateOptions): Promise<AgreementFieldMap> {
  if (options?.fieldMap) {
    return options.fieldMap;
  }

  return fetchAgreementFieldMap(UAR_DATA_FORM_RESIDENTIAL_SLUG);
}

async function embedImageFromBytes(doc: PDFDocument, bytes: Uint8Array) {
  try {
    return await doc.embedPng(bytes);
  } catch {
    return doc.embedJpg(bytes);
  }
}

export async function fillDataFormResidentialPdf(
  values: DataFormResolvedValues,
  options?: FillDataFormTemplateOptions,
): Promise<Uint8Array> {
  const [templateBytes, fieldMap] = await Promise.all([
    loadTemplateBytes(options),
    loadFieldMap(options),
  ]);
  const doc = await PDFDocument.load(templateBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const [name, field] of Object.entries(fieldMap.textFields)) {
    const value = values.text[name];
    if (!value) continue;
    drawTextField(getPage(doc, field.page), field, value, font);
  }

  for (const [name, field] of Object.entries(fieldMap.checkboxFields)) {
    drawCheckbox(getPage(doc, field.page), field, values.checkboxes[name] === true, boldFont);
  }

  const imageCache = new Map<string, Uint8Array>();

  for (const [name, field] of Object.entries(fieldMap.imageFields)) {
    let bytes = options?.imageBytesByField?.[name];
    if (!bytes) {
      const url = values.images[name];
      if (!url) continue;
      bytes = imageCache.get(url);
      if (!bytes) {
        try {
          bytes = await fetchSignatureImageBytes(url);
          imageCache.set(url, bytes);
        } catch {
          continue;
        }
      }
    }
    try {
      const image = await embedImageFromBytes(doc, bytes);
      getPage(doc, field.page).drawImage(image, {
        x: field.x,
        y: field.y,
        width: field.width,
        height: field.height,
      });
    } catch {
      // Skip undecodable signature images rather than failing the whole PDF.
    }
  }

  return doc.save();
}

export async function generateDataFormPdf(
  intakeValues: FullMlsInputValues,
  options?: FillDataFormTemplateOptions,
): Promise<{ pdfBytes: Uint8Array; resolvedValues: DataFormResolvedValues }> {
  const resolvedValues = options?.resolvedValues ?? resolveDataFormValues(intakeValues);
  const pdfBytes = await fillDataFormResidentialPdf(resolvedValues, options);
  return { pdfBytes, resolvedValues };
}
