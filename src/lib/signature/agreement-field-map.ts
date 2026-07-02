import { z } from "zod";

export const DEFAULT_PDF_PAGE_WIDTH = 612;
export const DEFAULT_PDF_PAGE_HEIGHT = 792;

export const pdfTextFieldSchema = z.object({
  page: z.number().int().min(0),
  x: z.number(),
  y: z.number(),
  size: z.number().optional(),
  maxWidth: z.number().optional(),
});

export const pdfCheckboxFieldSchema = z.object({
  page: z.number().int().min(0),
  x: z.number(),
  y: z.number(),
  size: z.number().optional(),
});

export const pdfImageFieldSchema = z.object({
  page: z.number().int().min(0),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const agreementFieldMapSchema = z.object({
  slug: z.string().min(1),
  version: z.string().min(1),
  pageSize: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  textFields: z.record(z.string(), pdfTextFieldSchema),
  checkboxFields: z.record(z.string(), pdfCheckboxFieldSchema),
  imageFields: z.record(z.string(), pdfImageFieldSchema),
  valueKeys: z.array(z.string()).optional(),
});

export type PdfTextField = z.infer<typeof pdfTextFieldSchema>;
export type PdfCheckboxField = z.infer<typeof pdfCheckboxFieldSchema>;
export type PdfImageField = z.infer<typeof pdfImageFieldSchema>;
export type AgreementFieldMap = z.infer<typeof agreementFieldMapSchema>;

export type AgreementFieldType = "text" | "checkbox" | "image";

export type AgreementFieldMapEntry = {
  name: string;
  type: AgreementFieldType;
  page: number;
  x: number;
  y: number;
  size?: number;
  maxWidth?: number;
  width?: number;
  height?: number;
};

export const AGREEMENT_FIELD_MAP_PATH_PREFIX = "templates/agreements/field-maps/" as const;

export function buildAgreementFieldMapPathname(slug: string, version: string): string {
  return `${AGREEMENT_FIELD_MAP_PATH_PREFIX}${slug}-${version}.json`;
}

export function parseAgreementFieldMap(data: unknown): AgreementFieldMap {
  return agreementFieldMapSchema.parse(data);
}

/** Convert browser click (top-left origin) to pdf-lib coordinates (bottom-left origin). */
export function browserClickToPdfCoords(
  clickX: number,
  clickY: number,
  renderScale: number,
  pageHeight = DEFAULT_PDF_PAGE_HEIGHT,
): { x: number; y: number } {
  const x = clickX / renderScale;
  const y = pageHeight - clickY / renderScale;
  return { x: Math.round(x), y: Math.round(y) };
}

/** Convert pdf-lib coordinates to browser overlay position (top-left origin). */
export function pdfCoordsToBrowserOverlay(
  x: number,
  y: number,
  renderScale: number,
  pageHeight = DEFAULT_PDF_PAGE_HEIGHT,
): { left: number; top: number } {
  return {
    left: x * renderScale,
    top: (pageHeight - y) * renderScale,
  };
}

export function listFieldMapEntries(fieldMap: AgreementFieldMap): AgreementFieldMapEntry[] {
  const entries: AgreementFieldMapEntry[] = [];

  for (const [name, field] of Object.entries(fieldMap.textFields)) {
    entries.push({
      name,
      type: "text",
      page: field.page,
      x: field.x,
      y: field.y,
      size: field.size,
      maxWidth: field.maxWidth,
    });
  }

  for (const [name, field] of Object.entries(fieldMap.checkboxFields)) {
    entries.push({
      name,
      type: "checkbox",
      page: field.page,
      x: field.x,
      y: field.y,
      size: field.size,
    });
  }

  for (const [name, field] of Object.entries(fieldMap.imageFields)) {
    entries.push({
      name,
      type: "image",
      page: field.page,
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
    });
  }

  return entries.sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
}

export function createEmptyFieldMap(
  slug: string,
  version: string,
): AgreementFieldMap {
  return {
    slug,
    version,
    pageSize: { width: DEFAULT_PDF_PAGE_WIDTH, height: DEFAULT_PDF_PAGE_HEIGHT },
    textFields: {},
    checkboxFields: {},
    imageFields: {},
    valueKeys: [],
  };
}

export function upsertFieldMapEntry(
  fieldMap: AgreementFieldMap,
  entry: AgreementFieldMapEntry,
): AgreementFieldMap {
  const next: AgreementFieldMap = {
    ...fieldMap,
    textFields: { ...fieldMap.textFields },
    checkboxFields: { ...fieldMap.checkboxFields },
    imageFields: { ...fieldMap.imageFields },
  };

  delete next.textFields[entry.name];
  delete next.checkboxFields[entry.name];
  delete next.imageFields[entry.name];

  if (entry.type === "text") {
    next.textFields[entry.name] = {
      page: entry.page,
      x: entry.x,
      y: entry.y,
      size: entry.size,
      maxWidth: entry.maxWidth,
    };
  } else if (entry.type === "checkbox") {
    next.checkboxFields[entry.name] = {
      page: entry.page,
      x: entry.x,
      y: entry.y,
      size: entry.size,
    };
  } else {
    next.imageFields[entry.name] = {
      page: entry.page,
      x: entry.x,
      y: entry.y,
      width: entry.width ?? 48,
      height: entry.height ?? 24,
    };
  }

  return next;
}

export function removeFieldMapEntry(fieldMap: AgreementFieldMap, name: string): AgreementFieldMap {
  const next: AgreementFieldMap = {
    ...fieldMap,
    textFields: { ...fieldMap.textFields },
    checkboxFields: { ...fieldMap.checkboxFields },
    imageFields: { ...fieldMap.imageFields },
  };

  delete next.textFields[name];
  delete next.checkboxFields[name];
  delete next.imageFields[name];

  return next;
}

export function exportFieldMapJson(fieldMap: AgreementFieldMap): string {
  return `${JSON.stringify(fieldMap, null, 2)}\n`;
}
