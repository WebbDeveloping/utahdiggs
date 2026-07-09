export function daysSince(date: Date | null | undefined): number | null {
  if (!date) return null;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function daysOnMarket(listDate: Date | null | undefined): number | null {
  return daysSince(listDate);
}

export function weeksSinceListDate(listDate: Date | null | undefined): number | null {
  const dom = daysOnMarket(listDate);
  if (dom == null) return null;
  return Math.floor(dom / 7) + 1;
}

export function domBadgeColor(
  dom: number,
  marketAvgDom: number | null | undefined,
): "success" | "warning" | "error" | "default" {
  if (marketAvgDom == null) return "default";
  if (dom <= marketAvgDom) return "success";
  if (dom <= marketAvgDom * 1.25) return "warning";
  return "error";
}

export function offerVsList(
  offerPrice: number | string | null | undefined,
  listPrice: number | string | null | undefined,
): { dollarDiff: number | null; percentDiff: number | null } {
  if (offerPrice == null || listPrice == null || offerPrice === "" || listPrice === "") {
    return { dollarDiff: null, percentDiff: null };
  }
  const offer = typeof offerPrice === "string" ? Number(offerPrice) : offerPrice;
  const list = typeof listPrice === "string" ? Number(listPrice) : listPrice;
  if (Number.isNaN(offer) || Number.isNaN(list) || list === 0) {
    return { dollarDiff: null, percentDiff: null };
  }
  const dollarDiff = offer - list;
  const percentDiff = (dollarDiff / list) * 100;
  return { dollarDiff, percentDiff };
}

export function formatOfferVsList(
  offerPrice: number | string | null | undefined,
  listPrice: number | string | null | undefined,
): string {
  const { dollarDiff, percentDiff } = offerVsList(offerPrice, listPrice);
  if (dollarDiff == null || percentDiff == null) return "—";
  const sign = dollarDiff >= 0 ? "+" : "−";
  const absDollar = Math.abs(dollarDiff);
  const absPercent = Math.abs(percentDiff);
  return `${sign}$${Math.round(absDollar).toLocaleString()} (${sign}${absPercent.toFixed(1)}%)`;
}
