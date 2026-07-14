import { ListingStatus, OfferStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getPriceHealth } from "@/lib/consumer/coaching-rules";
import type { PriceHealthResult } from "@/lib/consumer/coaching-rules";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import {
  daysOnMarket,
  daysSince,
  weeksSinceListDate,
} from "@/lib/consumer/listing-stats";
import type {
  ConsumerMarketDataRow,
  ConsumerOfferRow,
  ConsumerShowingRow,
} from "@/types/consumer-account-data";
import type { ListingOverviewMetrics } from "@/types/consumer-listing-detail";
import type { ListingStatusValue } from "@/lib/crm/listing-status";

const listingMetricsSelect = {
  id: true,
  address: true,
  city: true,
  status: true,
  listPrice: true,
  listDate: true,
  marketAvgDom: true,
  priceReductionCount: true,
  priceReductionDate: true,
  latestViews: true,
  latestSaves: true,
  blairNote: true,
  blairNoteDate: true,
} as const;

type ListingMetricsRow = {
  id: string;
  address: string;
  city: string;
  status: ListingStatus;
  listPrice: { toString(): string } | null;
  listDate: Date | null;
  marketAvgDom: number | null;
  priceReductionCount: number;
  priceReductionDate: Date | null;
  latestViews: number | null;
  latestSaves: number | null;
  blairNote: string | null;
  blairNoteDate: Date | null;
};

async function buildListingOverviewMetrics(
  listing: ListingMetricsRow,
): Promise<ListingOverviewMetrics> {
  const listingId = listing.id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    showingsLastWeek,
    totalShowings,
    offerCount,
    pendingOfferCount,
    weeklyStats,
  ] = await Promise.all([
    prisma.showing.count({
      where: { listingId, showingDate: { gte: sevenDaysAgo } },
    }),
    prisma.showing.count({ where: { listingId } }),
    prisma.offer.count({ where: { listingId } }),
    prisma.offer.count({
      where: { listingId, status: OfferStatus.PENDING_REVIEW },
    }),
    prisma.weeklyStat.findMany({
      where: { listingId },
      orderBy: { weekEnding: "desc" },
      take: 2,
      select: {
        lifetimeViews: true,
        ureFavoritesCumulative: true,
      },
    }),
  ]);

  const latestWeekly = weeklyStats[0] ?? null;
  const previousWeekly = weeklyStats[1] ?? null;

  let newSavesLastWeek: number | null = null;
  if (
    latestWeekly?.ureFavoritesCumulative != null &&
    previousWeekly?.ureFavoritesCumulative != null
  ) {
    newSavesLastWeek = Math.max(
      0,
      latestWeekly.ureFavoritesCumulative - previousWeekly.ureFavoritesCumulative,
    );
  }

  const webviews = latestWeekly?.lifetimeViews ?? listing.latestViews ?? null;

  const weekNumber = weeksSinceListDate(listing.listDate);
  const avgShowingsPerWeek =
    weekNumber != null
      ? Math.round((totalShowings / Math.max(weekNumber, 1)) * 10) / 10
      : null;

  return {
    listingId,
    listingAddress: listing.address,
    city: listing.city,
    status: listing.status as ListingStatusValue,
    listPrice: listing.listPrice?.toString() ?? null,
    daysOnMarket: daysOnMarket(listing.listDate),
    marketAvgDom: listing.marketAvgDom,
    showingsLastWeek,
    newSavesLastWeek,
    webviews,
    latestSaves: listing.latestSaves,
    avgShowingsPerWeek,
    totalShowings,
    offerCount,
    pendingOfferCount,
    priceReductionCount: listing.priceReductionCount,
    priceReductionDate: listing.priceReductionDate,
    daysSinceLastDrop: daysSince(listing.priceReductionDate),
    blairNote: listing.blairNote,
    blairNoteDate: listing.blairNoteDate,
  };
}

async function resolveOverviewListing(
  customerId: string,
  email: string,
  listingIdParam?: string | null,
): Promise<ListingMetricsRow | null> {
  const { listingIds } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return null;

  if (listingIdParam && listingIds.includes(listingIdParam)) {
    return prisma.listing.findFirst({
      where: { id: listingIdParam },
      select: listingMetricsSelect,
    });
  }

  return (
    (await prisma.listing.findFirst({
      where: {
        id: { in: listingIds },
        status: ListingStatus.ACTIVE,
      },
      orderBy: [{ listDate: "desc" }, { createdAt: "desc" }],
      select: listingMetricsSelect,
    })) ??
    (await prisma.listing.findFirst({
      where: { id: { in: listingIds } },
      orderBy: [{ listDate: "desc" }, { createdAt: "desc" }],
      select: listingMetricsSelect,
    }))
  );
}

export async function getListingOverviewMetrics(
  customerId: string,
  listingId: string,
): Promise<ListingOverviewMetrics | null> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId },
    select: listingMetricsSelect,
  });

  if (!listing) return null;
  return buildListingOverviewMetrics(listing);
}

/** Primary listing metrics for the account home Overview. */
export async function getAccountOverviewMetrics(
  customerId: string,
  email: string,
  listingIdParam?: string | null,
): Promise<ListingOverviewMetrics | null> {
  const primary = await resolveOverviewListing(customerId, email, listingIdParam);
  if (!primary) return null;
  return buildListingOverviewMetrics(primary);
}

export type AccountOverviewData = {
  metrics: ListingOverviewMetrics | null;
  priceHealth: PriceHealthResult | null;
  pendingOffer: ConsumerOfferRow | null;
  recentShowings: ConsumerShowingRow[];
  marketTeaser: ConsumerMarketDataRow | null;
  selectableListings: { id: string; address: string; city: string }[];
};

export async function getAccountOverviewData(
  customerId: string,
  email: string,
  listingIdParam?: string | null,
): Promise<AccountOverviewData> {
  const { listings, listingIds } = await getSellerListingsScope(customerId, email);

  const selectableListings = listings.map((listing) => ({
    id: listing.id,
    address: listing.address,
    city: listing.city,
  }));

  if (listingIds.length === 0) {
    return {
      metrics: null,
      priceHealth: null,
      pendingOffer: null,
      recentShowings: [],
      marketTeaser: null,
      selectableListings: [],
    };
  }

  const metrics = await getAccountOverviewMetrics(customerId, email, listingIdParam);
  if (!metrics) {
    return {
      metrics: null,
      priceHealth: null,
      pendingOffer: null,
      recentShowings: [],
      marketTeaser: null,
      selectableListings,
    };
  }

  const listingId = metrics.listingId;

  const [pendingOfferRow, recentShowingRows, marketRow] = await Promise.all([
    prisma.offer.findFirst({
      where: { listingId, status: OfferStatus.PENDING_REVIEW },
      orderBy: { submittedDate: "desc" },
      select: {
        id: true,
        listingId: true,
        submittedDate: true,
        offerPrice: true,
        buyersAgent: true,
        status: true,
      },
    }),
    prisma.showing.findMany({
      where: { listingId },
      orderBy: [{ showingDate: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        listingId: true,
        showingDate: true,
        showingTime: true,
        showingLabel: true,
        buyersAgent: true,
        feedback: true,
      },
    }),
    metrics.city.trim()
      ? prisma.marketData.findFirst({
          where: { city: metrics.city.trim() },
          orderBy: { reportDate: "desc" },
          select: {
            id: true,
            city: true,
            reportDate: true,
            homesForSale: true,
            newToMarket: true,
            homesSoldCount: true,
            avgDom: true,
            avgHomePrice: true,
            avgSoldPrice: true,
            pricePerSqFt: true,
            priceReductionsCount: true,
            soldToListedRatio: true,
          },
        })
      : Promise.resolve(null),
  ]);

  const pendingOffer: ConsumerOfferRow | null = pendingOfferRow
    ? {
        id: pendingOfferRow.id,
        listingId: pendingOfferRow.listingId,
        listingAddress: metrics.listingAddress,
        listingCity: metrics.city,
        listPrice: metrics.listPrice,
        submittedDate: pendingOfferRow.submittedDate,
        offerPrice: pendingOfferRow.offerPrice?.toString() ?? null,
        buyersAgent: pendingOfferRow.buyersAgent,
        status: pendingOfferRow.status,
      }
    : null;

  const recentShowings: ConsumerShowingRow[] = recentShowingRows.map((showing) => ({
    id: showing.id,
    listingId: showing.listingId,
    listingAddress: metrics.listingAddress,
    listingCity: metrics.city,
    showingDate: showing.showingDate,
    showingTime: showing.showingTime,
    showingLabel: showing.showingLabel,
    buyersAgent: showing.buyersAgent,
    feedback: showing.feedback,
  }));

  const marketTeaser: ConsumerMarketDataRow | null = marketRow
    ? {
        id: marketRow.id,
        city: marketRow.city,
        reportDate: marketRow.reportDate,
        homesForSale: marketRow.homesForSale,
        newToMarket: marketRow.newToMarket,
        homesSoldCount: marketRow.homesSoldCount,
        avgDom: marketRow.avgDom,
        avgHomePrice: marketRow.avgHomePrice?.toString() ?? null,
        avgSoldPrice: marketRow.avgSoldPrice?.toString() ?? null,
        pricePerSqFt: marketRow.pricePerSqFt?.toString() ?? null,
        priceReductionsCount: marketRow.priceReductionsCount,
        soldToListedRatio: marketRow.soldToListedRatio?.toString() ?? null,
      }
    : null;

  const priceHealth = getPriceHealth({
    status: metrics.status,
    daysOnMarket: metrics.daysOnMarket,
    totalShowings: metrics.totalShowings,
    showingsLastWeek: metrics.showingsLastWeek,
    pendingOfferCount: metrics.pendingOfferCount,
    daysSinceLastDrop: metrics.daysSinceLastDrop,
  });

  return {
    metrics,
    priceHealth,
    pendingOffer,
    recentShowings,
    marketTeaser,
    selectableListings,
  };
}
