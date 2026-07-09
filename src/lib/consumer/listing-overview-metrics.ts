import { ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import {
  daysOnMarket,
  daysSince,
  weeksSinceListDate,
} from "@/lib/consumer/listing-stats";
import type { ListingOverviewMetrics } from "@/types/consumer-listing-detail";

const listingMetricsSelect = {
  listPrice: true,
  listDate: true,
  marketAvgDom: true,
  priceReductionCount: true,
  priceReductionDate: true,
  latestViews: true,
  latestSaves: true,
} as const;

async function buildListingOverviewMetrics(
  listingId: string,
  listing: {
    listPrice: { toString(): string } | null;
    listDate: Date | null;
    marketAvgDom: number | null;
    priceReductionCount: number;
    priceReductionDate: Date | null;
    latestViews: number | null;
    latestSaves: number | null;
  },
): Promise<ListingOverviewMetrics> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [showingsLastWeek, totalShowings, offerCount, weeklyStats] =
    await Promise.all([
      prisma.showing.count({
        where: { listingId, showingDate: { gte: sevenDaysAgo } },
      }),
      prisma.showing.count({ where: { listingId } }),
      prisma.offer.count({ where: { listingId } }),
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
    listPrice: listing.listPrice?.toString() ?? null,
    daysOnMarket: daysOnMarket(listing.listDate),
    marketAvgDom: listing.marketAvgDom,
    showingsLastWeek,
    newSavesLastWeek,
    webviews,
    avgShowingsPerWeek,
    totalShowings,
    offerCount,
    priceReductionCount: listing.priceReductionCount,
    daysSinceLastDrop: daysSince(listing.priceReductionDate),
  };
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
  return buildListingOverviewMetrics(listingId, listing);
}

/** Primary listing metrics for the account home Overview. */
export async function getAccountOverviewMetrics(
  customerId: string,
  email: string,
): Promise<ListingOverviewMetrics | null> {
  const { listingIds } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return null;

  const primary =
    (await prisma.listing.findFirst({
      where: {
        id: { in: listingIds },
        status: ListingStatus.ACTIVE,
      },
      orderBy: [{ listDate: "desc" }, { createdAt: "desc" }],
      select: { id: true, ...listingMetricsSelect },
    })) ??
    (await prisma.listing.findFirst({
      where: { id: { in: listingIds } },
      orderBy: [{ listDate: "desc" }, { createdAt: "desc" }],
      select: { id: true, ...listingMetricsSelect },
    }));

  if (!primary) return null;

  const { id, ...listing } = primary;
  return buildListingOverviewMetrics(id, listing);
}
