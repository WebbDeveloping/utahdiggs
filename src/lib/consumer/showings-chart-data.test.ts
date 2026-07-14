import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildShowingsWeekChartData,
  weekEndingSunday,
} from "./showings-chart-data";
import type { ConsumerShowingRow } from "@/types/consumer-account-data";

function showing(
  partial: Partial<ConsumerShowingRow> &
    Pick<ConsumerShowingRow, "id" | "listingId" | "showingDate">,
): ConsumerShowingRow {
  return {
    listingAddress: "123 Main St",
    listingCity: "Provo",
    showingTime: null,
    showingLabel: null,
    buyersAgent: null,
    feedback: null,
    ...partial,
  };
}

describe("weekEndingSunday", () => {
  it("returns the same day for Sunday", () => {
    const sunday = weekEndingSunday(new Date(2026, 5, 14)); // Jun 14 2026 is Sunday
    assert.equal(sunday.getFullYear(), 2026);
    assert.equal(sunday.getMonth(), 5);
    assert.equal(sunday.getDate(), 14);
  });

  it("advances mid-week dates to the coming Sunday", () => {
    const ending = weekEndingSunday(new Date(2026, 5, 10)); // Wednesday
    assert.equal(ending.getDay(), 0);
    assert.equal(ending.getDate(), 14);
  });
});

describe("buildShowingsWeekChartData", () => {
  it("returns null for empty showings", () => {
    assert.equal(buildShowingsWeekChartData([]), null);
  });

  it("buckets showings into the last 8 weeks", () => {
    const now = new Date(2026, 5, 17); // Wednesday Jun 17 — week ending Jun 21
    const chart = buildShowingsWeekChartData(
      [
        showing({
          id: "1",
          listingId: "L1",
          showingDate: new Date(2026, 5, 16), // this week
        }),
        showing({
          id: "2",
          listingId: "L1",
          showingDate: new Date(2026, 5, 16),
        }),
        showing({
          id: "3",
          listingId: "L1",
          showingDate: new Date(2026, 5, 8), // prior week ending Jun 14
        }),
      ],
      8,
      now,
    );

    assert.ok(chart);
    assert.equal(chart.weekLabels.length, 8);
    assert.equal(chart.series.length, 1);
    const data = chart.series[0]?.data ?? [];
    assert.equal(data[data.length - 1], 2); // week ending Jun 21
    assert.equal(data[data.length - 2], 1); // week ending Jun 14
  });

  it("creates one series per listing", () => {
    const now = new Date(2026, 5, 17);
    const chart = buildShowingsWeekChartData(
      [
        showing({
          id: "1",
          listingId: "L1",
          listingAddress: "123 Main St",
          showingDate: new Date(2026, 5, 16),
        }),
        showing({
          id: "2",
          listingId: "L2",
          listingAddress: "456 Oak Ave",
          showingDate: new Date(2026, 5, 15),
        }),
      ],
      8,
      now,
    );

    assert.ok(chart);
    assert.equal(chart.series.length, 2);
    assert.ok(chart.series.some((s) => s.listingLabel === "123 Main St"));
    assert.ok(chart.series.some((s) => s.listingLabel === "456 Oak Ave"));
  });

  it("returns null when all showings fall outside the window", () => {
    const now = new Date(2026, 5, 17);
    const chart = buildShowingsWeekChartData(
      [
        showing({
          id: "1",
          listingId: "L1",
          showingDate: new Date(2025, 0, 1),
        }),
      ],
      8,
      now,
    );
    assert.equal(chart, null);
  });
});
