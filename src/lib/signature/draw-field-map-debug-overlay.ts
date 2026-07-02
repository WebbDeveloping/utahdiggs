import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";
import type { AgreementFieldMap } from "@/lib/signature/agreement-field-map";

const BODY_SIZE = 9;

export async function drawFieldMapDebugOverlay(
  doc: PDFDocument,
  fieldMap: AgreementFieldMap,
): Promise<void> {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const drawMarker = (
    pageIndex: number,
    x: number,
    y: number,
    label: string,
    color: ReturnType<typeof rgb>,
  ) => {
    const page = doc.getPage(pageIndex);
    page.drawCircle({ x, y, size: 3, color, borderWidth: 0 });
    page.drawText(label, { x: x + 5, y: y + 4, size: 6, font: bold, color });
  };

  for (const [name, field] of Object.entries(fieldMap.textFields)) {
    drawMarker(field.page, field.x, field.y, name, rgb(0.8, 0, 0));
    const page = doc.getPage(field.page);
    page.drawText("SAMPLE", {
      x: field.x,
      y: field.y,
      size: field.size ?? BODY_SIZE,
      font,
      color: rgb(0, 0, 0.8),
    });
  }

  for (const [name, field] of Object.entries(fieldMap.checkboxFields)) {
    drawMarker(field.page, field.x, field.y, name, rgb(0, 0.6, 0));
    const page = doc.getPage(field.page);
    page.drawText("X", {
      x: field.x,
      y: field.y,
      size: field.size ?? 10,
      font: bold,
      color: rgb(0, 0.5, 0),
    });
  }

  for (const [name, field] of Object.entries(fieldMap.imageFields)) {
    drawMarker(field.page, field.x, field.y, name, rgb(0.6, 0, 0.6));
    const page = doc.getPage(field.page);
    page.drawRectangle({
      x: field.x,
      y: field.y,
      width: field.width,
      height: field.height,
      borderColor: rgb(0.6, 0, 0.6),
      borderWidth: 1,
    });
  }
}

export async function generateFieldMapDebugPdf(
  templateBytes: Uint8Array,
  fieldMap: AgreementFieldMap,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(templateBytes);
  await drawFieldMapDebugOverlay(doc, fieldMap);
  return doc.save();
}
