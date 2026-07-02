import { ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getSellerLatestWeeklyStats } from "@/lib/consumer/weekly-stats-query";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import type { AccountDashboardStats, WeeklyReportData } from "@/types/consumer-account-data";
import { getSellerShowingsSince } from "@/lib/consumer/showings-query";

export async function getAccountDashboardStats(
  customerId: string,
  email: string,
): Promise<AccountDashboardStats> {
  const { listingIds, listings } = await getSellerListingsScope(customerId, email);

  if (listingIds.length === 0) {
    return {
      showingsLast30Days: 0,
      pendingOffers: 0,
      latestWeekViews: null,
      activeListingCount: 0,
    };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [showingsLast30Days, pendingOffers, latestStats] = await Promise.all([
    prisma.showing.count({
      where: {
        listingId: { in: listingIds },
        showingDate: { gte: thirtyDaysAgo },
      },
    }),
    prisma.offer.count({
      where: {
        listingId: { in: listingIds },
        status: "PENDING_REVIEW",
      },
    }),
    getSellerLatestWeeklyStats(customerId, email),
  ]);

  const latestWeekViews = latestStats.reduce(
    (sum, stat) => sum + (stat.listtracTotal30d ?? 0),
    0,
  );

  const activeListingCount = await prisma.listing.count({
    where: {
      id: { in: listingIds },
      status: {
        in: [
          ListingStatus.ACTIVE,
          ListingStatus.UNDER_CONTRACT,
          ListingStatus.PENDING,
        ],
      },
    },
  });

  return {
    showingsLast30Days,
    pendingOffers,
    latestWeekViews: latestStats.length > 0 ? latestWeekViews : null,
    activeListingCount,
  };
}

export async function getWeeklyReportData(
  customerId: string,
  email: string,
): Promise<WeeklyReportData> {
  const scope = await getSellerListingsScope(customerId, email);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [statsByListing, recentShowings] = await Promise.all([
    getSellerLatestWeeklyStats(customerId, email),
    getSellerShowingsSince(customerId, email, sevenDaysAgo),
  ]);

  return {
    listings: scope.listings.filter((listing) => listing.listDate != null),
    statsByListing,
    recentShowings,
  };
}
