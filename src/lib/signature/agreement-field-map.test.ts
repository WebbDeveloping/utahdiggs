import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  browserClickToPdfCoords,
  buildAgreementFieldMapPathname,
  exportFieldMapJson,
  parseAgreementFieldMap,
  pdfCoordsToBrowserOverlay,
  upsertFieldMapEntry,
} from "@/lib/signature/agreement-field-map";
import uarExclusiveRightToSellFieldMap from "@/lib/signature/field-maps/uar-exclusive-right-to-sell-2024-11-05.json";

describe("agreement-field-map", () => {
  it("parses the bundled UAR Form 8 map", () => {
    const fieldMap = parseAgreementFieldMap(uarExclusiveRightToSellFieldMap);
    assert.equal(fieldMap.slug, "uar-exclusive-right-to-sell");
    assert.equal(fieldMap.version, "2024-11-05");
    assert.ok(fieldMap.textFields.company);
    assert.ok(fieldMap.textFields.seller1AddressPhone);
    assert.ok(fieldMap.textFields.seller2AddressPhone);
    assert.ok(fieldMap.imageFields.seller1Signature);
  });

  it("builds blob pathnames from slug and version", () => {
    assert.equal(
      buildAgreementFieldMapPathname("uar-exclusive-right-to-sell", "2024-11-05"),
      "templates/agreements/field-maps/uar-exclusive-right-to-sell-2024-11-05.json",
    );
  });

  it("converts browser clicks to pdf-lib coordinates and back", () => {
    const renderScale = 1;
    const pageHeight = 792;
    const click = browserClickToPdfCoords(72, 100, renderScale, pageHeight);
    assert.equal(click.x, 72);
    assert.equal(click.y, 692);

    const overlay = pdfCoordsToBrowserOverlay(click.x, click.y, renderScale, pageHeight);
    assert.equal(overlay.left, 72);
    assert.equal(overlay.top, 100);
  });

  it("upserts field entries by name", () => {
    const fieldMap = parseAgreementFieldMap(uarExclusiveRightToSellFieldMap);
    const next = upsertFieldMapEntry(fieldMap, {
      name: "company",
      type: "text",
      page: 0,
      x: 80,
      y: 700,
      size: 9,
      maxWidth: 220,
    });

    assert.equal(next.textFields.company?.x, 80);
    assert.equal(next.textFields.company?.y, 700);
  });

  it("exports stable JSON", () => {
    const fieldMap = parseAgreementFieldMap(uarExclusiveRightToSellFieldMap);
    const json = exportFieldMapJson(fieldMap);
    assert.match(json, /"slug": "uar-exclusive-right-to-sell"/);
    assert.ok(json.endsWith("\n"));
  });
});
