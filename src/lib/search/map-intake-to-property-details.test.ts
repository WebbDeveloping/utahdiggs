import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MLS_TEST_LISTING_CONFIGS, buildMlsTestListingValues } from "../../../prisma/seed-data/mls-test-listings";
import { mapIntakeToPropertyDetails } from "./map-intake-to-property-details";

const testHome4Config = MLS_TEST_LISTING_CONFIGS.find((l) => l.portalSlug === "test-home-4");
assert.ok(testHome4Config, "test-home-4 seed config should exist");

const testHome4Values = buildMlsTestListingValues(
  testHome4Config,
  [{ name: "photo.jpg", url: "https://example.com/photo.jpg" }],
  "https://example.com/signature.png",
);

const listingContext = {
  yearBuilt: 2005,
  listingOffice: "Glide RE",
};

describe("mapIntakeToPropertyDetails", () => {
  it("returns minimal sections when intake data is empty", () => {
    const sections = mapIntakeToPropertyDetails({}, { yearBuilt: null, listingOffice: null });
    assert.deepEqual(sections, [
      {
        title: "Location",
        items: [{ label: "Originating MLS", value: "UtahRealEstate.com" }],
      },
    ]);
  });

  it("maps test-home-4 intake to expected accordion sections", () => {
    const sections = mapIntakeToPropertyDetails(testHome4Values, listingContext);
    const titles = sections.map((section) => section.title);

    assert.ok(titles.includes("Interior"));
    assert.ok(titles.includes("Exterior"));
    assert.ok(titles.includes("Schools"));
    assert.ok(titles.includes("Location"));

    const interior = sections.find((section) => section.title === "Interior");
    assert.ok(interior);
    assert.ok(interior.items.some((item) => item.label === "Flooring"));
    assert.ok(interior.items.some((item) => item.value.includes("Hardwood")));

    const exterior = sections.find((section) => section.title === "Exterior");
    assert.ok(exterior);
    assert.ok(exterior.items.some((item) => item.label === "Pool"));
    assert.ok(
      exterior.items.some(
        (item) => item.label === "Pool" && item.value.includes("In Ground"),
      ),
    );

    const schools = sections.find((section) => section.title === "Schools");
    assert.ok(schools);
    assert.ok(
      schools.items.some(
        (item) =>
          item.label === "District" &&
          item.value.includes("Salt Lake City School District"),
      ),
    );
  });

  it("omits sections with no populated values", () => {
    const sections = mapIntakeToPropertyDetails(
      { hoa: "No", "q184-doesthe": "No" },
      listingContext,
    );

    for (const section of sections) {
      assert.ok(section.items.length > 0);
    }
  });
});
