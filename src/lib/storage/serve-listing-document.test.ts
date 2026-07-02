import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LISTING_AGREEMENT_SIGNED_NAME } from "@/lib/documents/listing-document-kinds";
import {
  buildAccountDocumentHref,
  buildCrmDocumentHref,
} from "./document-access";
import {
  buildContentDisposition,
  getDocumentContentType,
  parseDocumentDisposition,
} from "./serve-listing-document";

describe("getDocumentContentType", () => {
  it("detects PDFs from name or URL", () => {
    assert.equal(
      getDocumentContentType(LISTING_AGREEMENT_SIGNED_NAME, "https://x/blob/uar-listing-agreement-signed.pdf"),
      "application/pdf",
    );
    assert.equal(
      getDocumentContentType("contract.PDF", "https://x/blob/file"),
      "application/pdf",
    );
  });

  it("detects common image types", () => {
    assert.equal(
      getDocumentContentType("MLS Input Signature", "https://x/blob/signature.png"),
      "image/png",
    );
    assert.equal(getDocumentContentType("photo.jpg", "https://x/blob/photo"), "image/jpeg");
    assert.equal(getDocumentContentType("photo.webp", "https://x/blob/photo"), "image/webp");
  });

  it("falls back to octet-stream", () => {
    assert.equal(getDocumentContentType("notes", "https://x/blob/file"), "application/octet-stream");
  });
});

describe("buildContentDisposition", () => {
  it("uses inline for view", () => {
    assert.equal(
      buildContentDisposition("view", "Listing Agreement (Signed).pdf"),
      'inline; filename="Listing Agreement _Signed_.pdf"',
    );
  });

  it("uses attachment for download", () => {
    assert.equal(
      buildContentDisposition("download", "Listing Agreement (Signed).pdf"),
      'attachment; filename="Listing Agreement _Signed_.pdf"',
    );
  });
});

describe("parseDocumentDisposition", () => {
  it("maps attachment to download", () => {
    assert.equal(parseDocumentDisposition("attachment"), "download");
  });

  it("defaults to view", () => {
    assert.equal(parseDocumentDisposition(null), "view");
    assert.equal(parseDocumentDisposition("inline"), "view");
  });
});

describe("document href builders", () => {
  it("builds account document URLs", () => {
    assert.equal(
      buildAccountDocumentHref("listing-1", "doc-1", "view"),
      "/api/account/listings/listing-1/documents/doc-1?disposition=inline",
    );
    assert.equal(
      buildAccountDocumentHref("listing-1", "doc-1", "download"),
      "/api/account/listings/listing-1/documents/doc-1?disposition=attachment",
    );
  });

  it("builds CRM document URLs", () => {
    assert.equal(
      buildCrmDocumentHref("listing-1", "doc-1", "view"),
      "/api/crm/listings/listing-1/documents/doc-1?disposition=inline",
    );
    assert.equal(
      buildCrmDocumentHref("listing-1", "doc-1", "download"),
      "/api/crm/listings/listing-1/documents/doc-1?disposition=attachment",
    );
  });
});
