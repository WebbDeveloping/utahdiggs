import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { getListingAgreementContent } from "@/content/listing-agreement";
import { SignatureMethod } from "@/generated/prisma/client";
import { LISTING_AGREEMENT_VERSION } from "@/lib/signature/agreement-audit";
import { generateSignedAgreementPdf } from "@/lib/signature/generate-signed-agreement-pdf";

const MINIMAL_PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
  0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
  0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
  0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

function buildFixtureInput(plan: "VIRTUAL" | "FULL_SERVICE") {
  const signedAt = new Date("2026-07-01T18:30:00.000Z");

  return {
    content: getListingAgreementContent(plan),
    property: {
      address: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    planLabel: plan === "FULL_SERVICE" ? "Full Service (1.5%)" : "Virtual (1%)",
    audit: {
      signerName: "Jane Seller",
      signerEmail: "jane@example.com",
      signatureMethod: SignatureMethod.TYPE,
      signedAt,
      agreementVersion: LISTING_AGREEMENT_VERSION,
      agreementHash: "abc123",
      ipAddress: "127.0.0.1",
      userAgent: "TestAgent/1.0",
    },
    signaturePngBytes: MINIMAL_PNG,
  };
}

describe("generateSignedAgreementPdf", () => {
  it("returns valid PDF bytes", async () => {
    const pdfBytes = await generateSignedAgreementPdf(buildFixtureInput("VIRTUAL"));
    const header = new TextDecoder().decode(pdfBytes.slice(0, 4));

    assert.equal(header, "%PDF");
    assert.ok(pdfBytes.length > 1000);
  });

  it("produces different output for different service plans", async () => {
    const virtualPdf = await generateSignedAgreementPdf(buildFixtureInput("VIRTUAL"));
    const fullServicePdf = await generateSignedAgreementPdf(buildFixtureInput("FULL_SERVICE"));

    const virtualHash = createHash("sha256").update(virtualPdf).digest("hex");
    const fullServiceHash = createHash("sha256").update(fullServicePdf).digest("hex");

    assert.notEqual(virtualHash, fullServiceHash);
  });

  it("produces stable output for the same input", async () => {
    const first = await generateSignedAgreementPdf(buildFixtureInput("VIRTUAL"));
    const second = await generateSignedAgreementPdf(buildFixtureInput("VIRTUAL"));

    assert.equal(
      createHash("sha256").update(first).digest("hex"),
      createHash("sha256").update(second).digest("hex"),
    );
  });
});
