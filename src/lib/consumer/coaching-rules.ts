import type { ListingStatusValue } from "@/lib/crm/listing-status";
import { domBadgeColor } from "@/lib/consumer/listing-stats";

export type PriceHealthVerdict = "on_pace" | "watch" | "price_review";

export type PriceHealthInput = {
  status: ListingStatusValue;
  daysOnMarket: number | null;
  totalShowings: number;
  showingsLastWeek: number;
  pendingOfferCount: number;
  daysSinceLastDrop: number | null;
};

export type PriceHealthResult = {
  verdict: PriceHealthVerdict;
  showPriceCta: boolean;
  why: string;
};

const NON_ACTIVE_FOR_PRICE_CTA: ReadonlySet<ListingStatusValue> = new Set([
  "UNDER_CONTRACT",
  "PENDING",
  "CLOSED",
  "CANCELLED",
]);

export { domBadgeColor };

export function formatPriceHealthLabel(verdict: PriceHealthVerdict): string {
  switch (verdict) {
    case "price_review":
      return "Price review";
    case "watch":
      return "Watch";
    case "on_pace":
      return "On pace";
  }
}

export function getPriceHealth(input: PriceHealthInput): PriceHealthResult {
  const {
    status,
    daysOnMarket,
    totalShowings,
    showingsLastWeek,
    pendingOfferCount,
    daysSinceLastDrop,
  } = input;

  if (NON_ACTIVE_FOR_PRICE_CTA.has(status) || status === "SUBMITTED") {
    return {
      verdict: "on_pace",
      showPriceCta: false,
      why:
        status === "SUBMITTED"
          ? "Listing isn’t active on the market yet."
          : "Listing isn’t actively for sale — no price adjustment needed here.",
    };
  }

  if (daysOnMarket == null) {
    return {
      verdict: "on_pace",
      showPriceCta: false,
      why: "List date isn’t set yet — price signals will appear once you’re live.",
    };
  }

  if (pendingOfferCount >= 1) {
    return {
      verdict: "on_pace",
      showPriceCta: false,
      why: "Offer pending — focus on terms before changing price.",
    };
  }

  if (daysSinceLastDrop != null && daysSinceLastDrop < 19) {
    return {
      verdict: "on_pace",
      showPriceCta: false,
      why: `Reduced ${daysSinceLastDrop} day${daysSinceLastDrop === 1 ? "" : "s"} ago — giving the new price time to work.`,
    };
  }

  if (status === "ACTIVE" && (daysOnMarket >= 21 || totalShowings >= 10)) {
    return {
      verdict: "price_review",
      showPriceCta: true,
      why: `${daysOnMarket} days on market, ${totalShowings} showing${totalShowings === 1 ? "" : "s"}, no pending offers.`,
    };
  }

  if (
    status === "ACTIVE" &&
    (daysOnMarket >= 12 || (daysOnMarket >= 14 && showingsLastWeek <= 2))
  ) {
    return {
      verdict: "watch",
      showPriceCta: false,
      why: "Keep an eye on traffic and showing feedback — pricing may need attention soon.",
    };
  }

  return {
    verdict: "on_pace",
    showPriceCta: false,
    why: "Early in the listing window — keep tracking showings and offers.",
  };
}
