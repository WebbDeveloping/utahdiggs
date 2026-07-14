import { prisma } from "@/lib/db";
import { getSellerListingsScope } from "@/lib/consumer/seller-listings-scope";
import type { ConsumerMarketDataRow } from "@/types/consumer-account-data";

export async function getSellerMarketData(
  customerId: string,
  email: string,
): Promise<ConsumerMarketDataRow[]> {
  const { listings } = await getSellerListingsScope(customerId, email);
  if (listings.length === 0) return [];

  const cities = [...new Set(listings.map((listing) => listing.city.trim()).filter(Boolean))];
  if (cities.length === 0) return [];

  const rows = await Promise.all(
    cities.map((city) =>
      prisma.marketData.findFirst({
        where: { city },
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
      }),
    ),
  );

  return rows
    .filter((row): row is NonNullable<typeof row> => row != null)
    .map((row) => ({
      id: row.id,
      city: row.city,
      reportDate: row.reportDate,
      homesForSale: row.homesForSale,
      newToMarket: row.newToMarket,
      homesSoldCount: row.homesSoldCount,
      avgDom: row.avgDom,
      avgHomePrice: row.avgHomePrice?.toString() ?? null,
      avgSoldPrice: row.avgSoldPrice?.toString() ?? null,
      pricePerSqFt: row.pricePerSqFt?.toString() ?? null,
      priceReductionsCount: row.priceReductionsCount,
      soldToListedRatio: row.soldToListedRatio ?? null,
    }))
    .sort((a, b) => a.city.localeCompare(b.city));
}
