import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLevelMatrixRowLabels,
  pruneLevelMatrixRows,
} from "./level-matrix-rows";

describe("getLevelMatrixRowLabels", () => {
  it("includes basement and above-grade rows when Yes (total count)", () => {
    assert.deepEqual(
      getLevelMatrixRowLabels({ hasBasement: "Yes", levelCount: "2" }),
      ["Basement", "Main Level"],
    );
    assert.deepEqual(
      getLevelMatrixRowLabels({ hasBasement: "Yes", levelCount: "3" }),
      ["Basement", "Main Level", "Level 2"],
    );
  });

  it("soft-floors Yes + 1 to Basement + Main Level", () => {
    assert.deepEqual(
      getLevelMatrixRowLabels({ hasBasement: "Yes", levelCount: "1" }),
      ["Basement", "Main Level"],
    );
  });

  it("omits basement and uses above-grade labels when No", () => {
    assert.deepEqual(
      getLevelMatrixRowLabels({ hasBasement: "No", levelCount: "1" }),
      ["Main Level"],
    );
    assert.deepEqual(
      getLevelMatrixRowLabels({ hasBasement: "No", levelCount: "2" }),
      ["Main Level", "Level 2"],
    );
    assert.deepEqual(
      getLevelMatrixRowLabels({ hasBasement: "No", levelCount: "4" }),
      ["Main Level", "Level 2", "Level 3", "Level 4"],
    );
  });

  it("defaults to Main Level when answers are missing", () => {
    assert.deepEqual(getLevelMatrixRowLabels({}), ["Main Level"]);
  });
});

describe("pruneLevelMatrixRows", () => {
  it("drops keys not in the visible label set", () => {
    const pruned = pruneLevelMatrixRows(
      {
        Basement: { bedrooms: "1" },
        "Main Level": { bedrooms: "3" },
        "Level 2": { bedrooms: "2" },
        "Second Story": { bedrooms: "9" },
      },
      ["Main Level", "Level 2"],
    );
    assert.deepEqual(pruned, {
      "Main Level": { bedrooms: "3" },
      "Level 2": { bedrooms: "2" },
    });
  });

  it("returns undefined when nothing remains", () => {
    assert.equal(
      pruneLevelMatrixRows({ Basement: { bedrooms: "1" } }, ["Main Level"]),
      undefined,
    );
  });
});
