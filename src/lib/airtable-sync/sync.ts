import type { PrismaClient } from "@/generated/prisma/client";
import { fetchAllAirtableRecords } from "@/lib/airtable-sync/fetch";
import {
  asDate,
  asNumber,
  asString,
  linkedIds,
  mapListingStatus,
} from "@/lib/airtable-sync/mappers";

const TABLES = {
  listings: "Listings",
  weeklyStats: "Weekly Stats",
  marketData: "Market Data",
} as const;

export type AirtableSyncResult = {
  listings: { synced: number; skipped: number };
  weeklyStats: { synced: number; skipped: number };
  marketData: { synced: number; skipped: number };
};

export async function syncAirtableData(
  prisma: PrismaClient,
): Promise<AirtableSyncResult> {
  const listingIdMap = new Map<string, string>();
  for (const row of await prisma.listing.findMany({
    where: { airtableRecordId: { not: null } },
    select: { id: true, airtableRecordId: true },
  })) {
    if (row.airtableRecordId) {
      listingIdMap.set(row.airtableRecordId, row.id);
    }
  }

  const result: AirtableSyncResult = {
    listings: { synced: 0, skipped: 0 },
    weeklyStats: { synced: 0, skipped: 0 },
    marketData: { synced: 0, skipped: 0 },
  };

  for (const record of await fetchAllAirtableRecords(TABLES.listings)) {
    const f = record.fields;
    const listingSlug = asString(f["Portal Slug"]);
    if (!listingSlug) {
      result.listings.skipped += 1;
      continue;
    }

    const mlsNumber = asString(f["MLS Number"]);
    const existing = await prisma.listing.findFirst({
      where: {
        OR: [
          { airtableRecordId: record.id },
          { listingSlug },
          ...(mlsNumber ? [{ mlsNumber }] : []),
        ],
      },
      select: { id: true },
    });

    const listingData = {
      airtableRecordId: record.id,
      address: asString(f["Address"]) ?? "",
      city: asString(f["City"]) ?? "",
      state: asString(f["State"]) ?? "",
      zip: asString(f["Zip"]) ?? "",
      listPrice: asNumber(f["List Price"]),
      beds: asString(f["Beds"]),
      baths: asString(f["Baths"]),
      sqft: asString(f["Sqft"]),
      mlsNumber,
      listDate: asDate(f["List Date"]),
      status: mapListingStatus(f["Status"]),
      listingSlug,
      offerFormUrl: asString(f["Offer Form URL"]),
      blairNote: asString(f["Blair Note"]),
      blairNoteDate: asDate(f["Blair Note Date"]),
      latestViews: asNumber(f["Latest Views"]),
      latestSaves: asNumber(f["Latest Saves"]),
      latestShowings: asNumber(f["Latest Showings"]),
      priceReductionDate: asDate(f["Price Reduction Date"]),
      priceReductionCount: asNumber(f["Price Reduction Count"]) ?? 0,
      activeOffers: asNumber(f["Active Offers"]) ?? 0,
      marketAvgDom: asNumber(f["Market Avg DOM"]),
      portfolioGroup: asString(f["Portfolio Group"]),
    };

    const listing = existing
      ? await prisma.listing.update({
          where: { id: existing.id },
          data: listingData,
        })
      : await prisma.listing.create({ data: listingData });

    listingIdMap.set(record.id, listing.id);
    result.listings.synced += 1;
  }

  for (const record of await fetchAllAirtableRecords(TABLES.weeklyStats)) {
    const f = record.fields;
    const listingAirtableId = linkedIds(f["Listing"])[0];
    const listingId = listingAirtableId
      ? listingIdMap.get(listingAirtableId)
      : undefined;
    const weekEnding = asDate(f["Week Ending"]);
    if (!listingId || !weekEnding) {
      result.weeklyStats.skipped += 1;
      continue;
    }

    const statData = {
      airtableRecordId: record.id,
      listtracTotal30d: asNumber(f["Listtrac Total (30d)"]),
      ureViews30d: asNumber(f["URE Views (30d)"]),
      zillowViews30d: asNumber(f["Zillow Views (30d)"]),
      realtorViews30d: asNumber(f["Realtor.com Views (30d)"]),
      homesViews30d: asNumber(f["Homes.com Views (30d)"]),
      truliaViews30d: asNumber(f["Trulia Views (30d)"]),
      ureFavoritesCumulative: asNumber(f["URE Favorites (cumulative)"]),
      lifetimeViews: asNumber(f["Lifetime Views"]),
    };

    await prisma.weeklyStat.upsert({
      where: {
        listingId_weekEnding: { listingId, weekEnding },
      },
      update: statData,
      create: {
        ...statData,
        listingId,
        weekEnding,
      },
    });

    result.weeklyStats.synced += 1;
  }

  for (const record of await fetchAllAirtableRecords(TABLES.marketData)) {
    const f = record.fields;
    const city = asString(f["City"]);
    const reportDate = asDate(f["Report Date"]);
    if (!city || !reportDate) {
      result.marketData.skipped += 1;
      continue;
    }

    const marketData = {
      airtableRecordId: record.id,
      homesForSale: asNumber(f["Homes For Sale"]),
      homesForSaleChangePct: asNumber(f["Homes For Sale Change Pct"]),
      newToMarket: asNumber(f["New To Market"]),
      newToMarketChangePct: asNumber(f["New To Market Change Pct"]),
      homesSoldCount: asNumber(f["Homes Sold Count"]),
      homesSoldChangePct: asNumber(f["Homes Sold Change Pct"]),
      avgDom: asNumber(f["Avg DOM"]),
      domChangePct: asNumber(f["DOM Change Pct"]),
      avgHomePrice: asNumber(f["Avg Home Price"]),
      avgHomePriceChangePct: asNumber(f["Avg Home Price Change Pct"]),
      avgSoldPrice: asNumber(f["Avg Sold Price"]),
      avgSoldPriceChangePct: asNumber(f["Avg Sold Price Change Pct"]),
      pricePerSqFt: asNumber(f["Price Per Sq Ft"]),
      pricePerSqFtChangePct: asNumber(f["Price Per Sq Ft Change Pct"]),
      priceReductionsCount: asNumber(f["Price Reductions Count"]),
      priceReductionsChangePct: asNumber(f["Price Reductions Change Pct"]),
      soldToListedRatio: asNumber(f["Sold To Listed Ratio"]),
      soldToListedChangePct: asNumber(f["Sold To Listed Change Pct"]),
    };

    await prisma.marketData.upsert({
      where: { city_reportDate: { city, reportDate } },
      update: marketData,
      create: {
        ...marketData,
        city,
        reportDate,
      },
    });

    result.marketData.synced += 1;
  }

  return result;
}
