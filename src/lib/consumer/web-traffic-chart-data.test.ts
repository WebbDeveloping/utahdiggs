import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPortalBreakdownChartData,
  buildViewsTrendChartData,
} from "./web-traffic-chart-data";
import type { ConsumerWeeklyStatRow } from "@/types/consumer-account-data";

function row(
  partial: Partial<ConsumerWeeklyStatRow> &
    Pick<ConsumerWeeklyStatRow, "id" | "listingId" | "weekEnding">,
): ConsumerWeeklyStatRow {
  return {
    listingAddress: "123 Main St",
    listingCity: "Provo",
    listtracTotal30d: null,
    ureViews30d: null,
    zillowViews30d: null,
    realtorViews30d: null,
    homesViews30d: null,
    truliaViews30d: null,
    ureFavoritesCumulative: null,
    lifetimeViews: null,
    ...partial,
  };
}

describe("buildViewsTrendChartData", () => {
  it("returns null for empty history", () => {
    assert.equal(buildViewsTrendChartData([]), null);
  });

  it("uses lifetimeViews deltas when consecutive values exist", () => {
    const history = [
      row({
        id: "1",
        listingId: "L1",
        weekEnding: new Date("2026-06-01"),
        lifetimeViews: 100,
        listtracTotal30d: 40,
      }),
      row({
        id: "2",
        listingId: "L1",
        weekEnding: new Date("2026-06-08"),
        lifetimeViews: 130,
        listtracTotal30d: 50,
      }),
      row({
        id: "3",
        listingId: "L1",
        weekEnding: new Date("2026-06-15"),
        lifetimeViews: 145,
        listtracTotal30d: 45,
      }),
    ];

    const chart = buildViewsTrendChartData(history, 8);
    assert.ok(chart);
    assert.equal(chart.mode, "weekly_new");
    assert.deepEqual(chart.series[0]?.data, [null, 30, 15]);
  });

  it("falls back to rolling 30d when lifetimeViews are missing", () => {
    const history = [
      row({
        id: "1",
        listingId: "L1",
        weekEnding: new Date("2026-06-01"),
        listtracTotal30d: 40,
      }),
      row({
        id: "2",
        listingId: "L1",
        weekEnding: new Date("2026-06-08"),
        listtracTotal30d: 55,
      }),
    ];

    const chart = buildViewsTrendChartData(history, 8);
    assert.ok(chart);
    assert.equal(chart.mode, "rolling_30d");
    assert.deepEqual(chart.series[0]?.data, [40, 55]);
  });
});

describe("buildPortalBreakdownChartData", () => {
  it("skips null and zero portal values", () => {
    const breakdowns = buildPortalBreakdownChartData([
      row({
        id: "1",
        listingId: "L1",
        weekEnding: new Date("2026-06-15"),
        ureViews30d: 12,
        zillowViews30d: 0,
        realtorViews30d: null,
        homesViews30d: 5,
        truliaViews30d: 0,
      }),
    ]);

    assert.equal(breakdowns.length, 1);
    assert.deepEqual(breakdowns[0]?.items, [
      { portal: "URE", views: 12 },
      { portal: "Homes.com", views: 5 },
    ]);
  });

  it("omits listings with no positive portal views", () => {
    const breakdowns = buildPortalBreakdownChartData([
      row({
        id: "1",
        listingId: "L1",
        weekEnding: new Date("2026-06-15"),
        ureViews30d: 0,
        zillowViews30d: null,
      }),
    ]);
    assert.deepEqual(breakdowns, []);
  });
});
