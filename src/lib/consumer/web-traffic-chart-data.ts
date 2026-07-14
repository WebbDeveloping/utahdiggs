import type { ConsumerWeeklyStatRow } from "@/types/consumer-account-data";

export type ViewsTrendMode = "weekly_new" | "rolling_30d";

export type ViewsTrendSeries = {
  listingId: string;
  listingLabel: string;
  data: (number | null)[];
};

export type ViewsTrendChartData = {
  mode: ViewsTrendMode;
  weekLabels: string[];
  series: ViewsTrendSeries[];
};

export type PortalBreakdownItem = {
  portal: string;
  views: number;
};

export type PortalBreakdownChartData = {
  listingId: string;
  listingAddress: string;
  listingCity: string;
  items: PortalBreakdownItem[];
};

const PORTAL_FIELDS = [
  { key: "ureViews30d", label: "URE" },
  { key: "zillowViews30d", label: "Zillow" },
  { key: "realtorViews30d", label: "Realtor.com" },
  { key: "homesViews30d", label: "Homes.com" },
  { key: "truliaViews30d", label: "Trulia" },
] as const;

function formatWeekLabel(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function weekKey(date: Date): string {
  return new Date(date).toISOString().slice(0, 10);
}

function groupByListing(history: ConsumerWeeklyStatRow[]): Map<string, ConsumerWeeklyStatRow[]> {
  const byListing = new Map<string, ConsumerWeeklyStatRow[]>();
  for (const row of history) {
    const rows = byListing.get(row.listingId) ?? [];
    rows.push(row);
    byListing.set(row.listingId, rows);
  }
  for (const rows of byListing.values()) {
    rows.sort((a, b) => a.weekEnding.getTime() - b.weekEnding.getTime());
  }
  return byListing;
}

function listingCanUseLifetimeDeltas(rows: ConsumerWeeklyStatRow[]): boolean {
  let consecutive = 0;
  for (const row of rows) {
    if (row.lifetimeViews != null) {
      consecutive += 1;
      if (consecutive >= 2) return true;
    } else {
      consecutive = 0;
    }
  }
  return false;
}

function valueForWeek(
  rows: ConsumerWeeklyStatRow[],
  ending: Date,
  mode: ViewsTrendMode,
): number | null {
  const key = weekKey(ending);
  const index = rows.findIndex((row) => weekKey(row.weekEnding) === key);
  if (index < 0) return null;

  if (mode === "rolling_30d") {
    return rows[index]?.listtracTotal30d ?? null;
  }

  if (index === 0) return null;
  const current = rows[index]?.lifetimeViews;
  const previous = rows[index - 1]?.lifetimeViews;
  if (current == null || previous == null) return null;
  return Math.max(0, current - previous);
}

/**
 * Build a multi-listing views trend for the last `weeks` week-ending dates present in history.
 * Prefers lifetimeViews week-over-week deltas when every listing can support it.
 */
export function buildViewsTrendChartData(
  history: ConsumerWeeklyStatRow[],
  weeks = 8,
): ViewsTrendChartData | null {
  if (history.length === 0) return null;

  const byListing = groupByListing(history);
  const listings = [...byListing.entries()];
  if (listings.length === 0) return null;

  const allWeekTimestamps = [
    ...new Set(history.map((row) => new Date(row.weekEnding).getTime())),
  ].sort((a, b) => a - b);
  const selectedTimestamps = allWeekTimestamps.slice(-weeks);
  if (selectedTimestamps.length === 0) return null;

  const weekEndings = selectedTimestamps.map((ts) => new Date(ts));
  const canUseLifetime = listings.every(([, rows]) => listingCanUseLifetimeDeltas(rows));
  const mode: ViewsTrendMode = canUseLifetime ? "weekly_new" : "rolling_30d";

  const series: ViewsTrendSeries[] = listings.map(([listingId, rows]) => {
    const label = rows[0]?.listingAddress ?? "Listing";
    return {
      listingId,
      listingLabel: label,
      data: weekEndings.map((ending) => valueForWeek(rows, ending, mode)),
    };
  });

  const hasAnyPoint = series.some((s) => s.data.some((v) => v != null));
  if (!hasAnyPoint) return null;

  return {
    mode,
    weekLabels: weekEndings.map(formatWeekLabel),
    series,
  };
}

export function buildPortalBreakdownChartData(
  latestStats: ConsumerWeeklyStatRow[],
): PortalBreakdownChartData[] {
  return latestStats
    .map((stat) => {
      const items: PortalBreakdownItem[] = [];
      for (const field of PORTAL_FIELDS) {
        const views = stat[field.key];
        if (views != null && views > 0) {
          items.push({ portal: field.label, views });
        }
      }
      return {
        listingId: stat.listingId,
        listingAddress: stat.listingAddress,
        listingCity: stat.listingCity,
        items,
      };
    })
    .filter((row) => row.items.length > 0);
}

export function portalBreakdownForListing(
  breakdowns: PortalBreakdownChartData[],
  listingId: string,
): PortalBreakdownChartData | null {
  return breakdowns.find((row) => row.listingId === listingId) ?? null;
}
