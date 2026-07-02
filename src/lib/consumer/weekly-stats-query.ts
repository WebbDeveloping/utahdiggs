import { prisma } from "@/lib/db";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import type { ConsumerWeeklyStatRow } from "@/types/consumer-account-data";

function mapWeeklyStat(
  stat: {
    id: string;
    listingId: string;
    weekEnding: Date;
    listtracTotal30d: number | null;
    ureViews30d: number | null;
    zillowViews30d: number | null;
    realtorViews30d: number | null;
    homesViews30d: number | null;
    truliaViews30d: number | null;
    ureFavoritesCumulative: number | null;
    lifetimeViews: number | null;
  },
  listingAddress: string,
  listingCity: string,
): ConsumerWeeklyStatRow {
  return {
    id: stat.id,
    listingId: stat.listingId,
    listingAddress,
    listingCity,
    weekEnding: stat.weekEnding,
    listtracTotal30d: stat.listtracTotal30d,
    ureViews30d: stat.ureViews30d,
    zillowViews30d: stat.zillowViews30d,
    realtorViews30d: stat.realtorViews30d,
    homesViews30d: stat.homesViews30d,
    truliaViews30d: stat.truliaViews30d,
    ureFavoritesCumulative: stat.ureFavoritesCumulative,
    lifetimeViews: stat.lifetimeViews,
  };
}

const weeklyStatSelect = {
  id: true,
  listingId: true,
  weekEnding: true,
  listtracTotal30d: true,
  ureViews30d: true,
  zillowViews30d: true,
  realtorViews30d: true,
  homesViews30d: true,
  truliaViews30d: true,
  ureFavoritesCumulative: true,
  lifetimeViews: true,
} as const;

export async function getSellerLatestWeeklyStats(
  customerId: string,
  email: string,
): Promise<ConsumerWeeklyStatRow[]> {
  const { listingIds, listings } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return [];

  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  const stats = await Promise.all(
    listingIds.map((listingId) =>
      prisma.weeklyStat.findFirst({
        where: { listingId },
        orderBy: { weekEnding: "desc" },
        select: weeklyStatSelect,
      }),
    ),
  );

  return stats
    .filter((stat): stat is NonNullable<typeof stat> => stat != null)
    .map((stat) => {
      const listing = listingById.get(stat.listingId);
      return mapWeeklyStat(
        stat,
        listing?.address ?? "Unknown",
        listing?.city ?? "",
      );
    })
    .sort((a, b) => b.weekEnding.getTime() - a.weekEnding.getTime());
}

export async function getSellerWeeklyStatHistory(
  customerId: string,
  email: string,
  weeks = 8,
): Promise<ConsumerWeeklyStatRow[]> {
  const { listingIds, listings } = await getSellerListingsScope(customerId, email);
  if (listingIds.length === 0) return [];

  const listingById = new Map(listings.map((listing) => [listing.id, listing]));

  const stats = await prisma.weeklyStat.findMany({
    where: { listingId: { in: listingIds } },
    orderBy: [{ weekEnding: "desc" }, { listingId: "asc" }],
    take: listingIds.length * weeks,
    select: weeklyStatSelect,
  });

  return stats.map((stat) => {
    const listing = listingById.get(stat.listingId);
    return mapWeeklyStat(
      stat,
      listing?.address ?? "Unknown",
      listing?.city ?? "",
    );
  });
}
