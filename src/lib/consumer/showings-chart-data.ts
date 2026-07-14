import type { ConsumerShowingRow } from "@/types/consumer-account-data";

export type ShowingsTrendSeries = {
  listingId: string;
  listingLabel: string;
  data: number[];
};

export type ShowingsWeekChartData = {
  weekLabels: string[];
  series: ShowingsTrendSeries[];
};

/** Sunday (local) that ends the week containing `date`. */
export function weekEndingSunday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  if (day !== 0) {
    d.setDate(d.getDate() + (7 - day));
  }
  return d;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function weekKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildLastWeekEndings(count: number, from = new Date()): Date[] {
  const current = weekEndingSunday(from);
  const endings: Date[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const ending = new Date(current);
    ending.setDate(current.getDate() - i * 7);
    endings.push(ending);
  }
  return endings;
}

/**
 * Bucket showings into the last `weeks` Sunday-ending weeks.
 * Multi-listing sellers get one series per listing (grouped bars).
 */
export function buildShowingsWeekChartData(
  showings: ConsumerShowingRow[],
  weeks = 8,
  now = new Date(),
): ShowingsWeekChartData | null {
  if (showings.length === 0) return null;

  const weekEndings = buildLastWeekEndings(weeks, now);
  const weekKeys = weekEndings.map(weekKey);
  const weekKeySet = new Set(weekKeys);

  type ListingMeta = { listingId: string; listingLabel: string; counts: Map<string, number> };
  const byListing = new Map<string, ListingMeta>();

  for (const showing of showings) {
    const ending = weekEndingSunday(new Date(showing.showingDate));
    const key = weekKey(ending);
    if (!weekKeySet.has(key)) continue;

    let meta = byListing.get(showing.listingId);
    if (!meta) {
      meta = {
        listingId: showing.listingId,
        listingLabel: showing.listingAddress,
        counts: new Map(),
      };
      byListing.set(showing.listingId, meta);
    }
    meta.counts.set(key, (meta.counts.get(key) ?? 0) + 1);
  }

  if (byListing.size === 0) return null;

  const series: ShowingsTrendSeries[] = [...byListing.values()].map((meta) => ({
    listingId: meta.listingId,
    listingLabel: meta.listingLabel,
    data: weekKeys.map((key) => meta.counts.get(key) ?? 0),
  }));

  return {
    weekLabels: weekEndings.map(formatWeekLabel),
    series,
  };
}
