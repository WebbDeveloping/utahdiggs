import { PDFDocument, StandardFonts, type PDFFont, type PDFPage, rgb } from "pdf-lib";
import type { SignatureMethod } from "@/generated/prisma/client";

export type SignedAgreementPdfInput = {
  content: {
    title: string;
    sections: { heading: string; body: string }[];
  };
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  planLabel: string;
  audit: {
    signerName: string;
    signerEmail: string;
    signatureMethod: SignatureMethod;
    signedAt: Date;
    agreementVersion: string;
    agreementHash: string;
    ipAddress: string | null;
    userAgent: string | null;
  };
  signaturePngBytes: Uint8Array;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = 60;

const BODY_SIZE = 10;
const HEADING_SIZE = 11;
const TITLE_SIZE = 16;
const FOOTER_SIZE = 8;
const LINE_HEIGHT = 14;

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

type PdfWriter = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  bodyFont: PDFFont;
  boldFont: PDFFont;
};

function ensureSpace(writer: PdfWriter, needed: number): void {
  if (writer.y - needed >= BOTTOM_MARGIN) return;

  writer.page = writer.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  writer.y = PAGE_HEIGHT - MARGIN;
}

function drawLines(
  writer: PdfWriter,
  lines: string[],
  options: {
    font: PDFFont;
    size: number;
    color?: ReturnType<typeof rgb>;
    indent?: number;
  },
): void {
  const color = options.color ?? rgb(0.15, 0.15, 0.15);
  const indent = options.indent ?? 0;

  for (const line of lines) {
    ensureSpace(writer, LINE_HEIGHT);
    writer.page.drawText(line, {
      x: MARGIN + indent,
      y: writer.y,
      size: options.size,
      font: options.font,
      color,
    });
    writer.y -= LINE_HEIGHT;
  }
}

function drawParagraph(
  writer: PdfWriter,
  text: string,
  options?: { indent?: number; spacingAfter?: number },
): void {
  const lines = splitTextIntoLines(text, writer.bodyFont, BODY_SIZE, CONTENT_WIDTH);
  drawLines(writer, lines, {
    font: writer.bodyFont,
    size: BODY_SIZE,
    indent: options?.indent,
  });
  writer.y -= options?.spacingAfter ?? 8;
}

function formatSignatureMethod(method: SignatureMethod): string {
  return method === "TYPE" ? "Typed" : "Drawn";
}

function formatSignedAt(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export async function generateSignedAgreementPdf(
  input: SignedAgreementPdfInput,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const writer: PdfWriter = {
    doc,
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN,
    bodyFont,
    boldFont,
  };

  const propertyLine = `${input.property.address}, ${input.property.city}, ${input.property.state} ${input.property.zip}`;

  writer.page.drawText(input.content.title, {
    x: MARGIN,
    y: writer.y,
    size: TITLE_SIZE,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  writer.y -= 24;

  drawParagraph(writer, propertyLine, { spacingAfter: 4 });
  drawParagraph(writer, `Plan: ${input.planLabel}`, { spacingAfter: 16 });

  for (const section of input.content.sections) {
    ensureSpace(writer, LINE_HEIGHT * 2);
    writer.page.drawText(section.heading, {
      x: MARGIN,
      y: writer.y,
      size: HEADING_SIZE,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    writer.y -= LINE_HEIGHT + 2;
    drawParagraph(writer, section.body, { spacingAfter: 12 });
  }

  ensureSpace(writer, 120);
  writer.page.drawLine({
    start: { x: MARGIN, y: writer.y },
    end: { x: PAGE_WIDTH - MARGIN, y: writer.y },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  writer.y -= 16;

  const signatureImage = await doc.embedPng(input.signaturePngBytes);
  const signatureWidth = 200;
  const signatureHeight = 80;
  ensureSpace(writer, signatureHeight + 40);
  writer.page.drawImage(signatureImage, {
    x: MARGIN,
    y: writer.y - signatureHeight,
    width: signatureWidth,
    height: signatureHeight,
  });
  writer.y -= signatureHeight + 8;

  drawParagraph(writer, input.audit.signerName, { spacingAfter: 2 });
  drawParagraph(writer, formatSignedAt(input.audit.signedAt), { spacingAfter: 16 });

  const auditLines = [
    `Signed electronically by ${input.audit.signerName} (${input.audit.signerEmail})`,
    `Signature method: ${formatSignatureMethod(input.audit.signatureMethod)}`,
    `Agreement version: ${input.audit.agreementVersion}`,
    `Document hash: ${input.audit.agreementHash}`,
    `Signed at (UTC): ${input.audit.signedAt.toISOString()}`,
  ];

  if (input.audit.ipAddress) {
    auditLines.push(`IP address: ${input.audit.ipAddress}`);
  }
  if (input.audit.userAgent) {
    auditLines.push(`User agent: ${input.audit.userAgent}`);
  }

  ensureSpace(writer, auditLines.length * 10 + 8);
  for (const line of auditLines) {
    const wrapped = splitTextIntoLines(line, bodyFont, FOOTER_SIZE, CONTENT_WIDTH);
    drawLines(writer, wrapped, {
      font: bodyFont,
      size: FOOTER_SIZE,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  return doc.save();
}
