import type { PrismaClient } from "@/generated/prisma/client";
import { fetchAllAirtableRecords } from "@/lib/airtable-sync/fetch";
import {
  asDate,
  asNumber,
  asString,
  linkedIds,
} from "@/lib/airtable-sync/mappers";
import {
  buildListingMatchIndexes,
  parseMlsFromWeekLabel,
  resolveListingId,
  type AirtableListingLookup,
} from "@/lib/airtable-sync/match-listing";

const TABLES = {
  listings: "Listings",
  weeklyStats: "Weekly Stats",
  marketData: "Market Data",
} as const;

export type AirtableSyncResult = {
  weeklyStats: {
    synced: number;
    skipped: number;
    matchedByMls: number;
    matchedByAddress: number;
  };
  marketData: { synced: number; skipped: number };
};

export async function syncAirtableData(
  prisma: PrismaClient,
): Promise<AirtableSyncResult> {
  const result: AirtableSyncResult = {
    weeklyStats: {
      synced: 0,
      skipped: 0,
      matchedByMls: 0,
      matchedByAddress: 0,
    },
    marketData: { synced: 0, skipped: 0 },
  };

  const airtableListings = new Map<string, AirtableListingLookup>();
  for (const record of await fetchAllAirtableRecords(TABLES.listings)) {
    const f = record.fields;
    airtableListings.set(record.id, {
      mlsNumber: asString(f["MLS Number"])?.trim() || null,
      address: asString(f["Address"]) ?? "",
      city: asString(f["City"]) ?? "",
    });
  }

  const pgListings = await prisma.listing.findMany({
    select: {
      id: true,
      mlsNumber: true,
      address: true,
      city: true,
    },
  });
  const indexes = buildListingMatchIndexes(pgListings);

  for (const record of await fetchAllAirtableRecords(TABLES.weeklyStats)) {
    const f = record.fields;
    const weekEnding = asDate(f["Week Ending"]);
    if (!weekEnding) {
      result.weeklyStats.skipped += 1;
      continue;
    }

    const listingAirtableId = linkedIds(f["Listing"])[0];
    const airtableListing = listingAirtableId
      ? airtableListings.get(listingAirtableId)
      : undefined;
    const weekLabelMls = parseMlsFromWeekLabel(asString(f["Week Label"]));

    const match = resolveListingId(indexes, airtableListing, weekLabelMls);
    if (!match.listingId || !match.method) {
      result.weeklyStats.skipped += 1;
      continue;
    }

    const listingId = match.listingId;
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
    if (match.method === "mls") {
      result.weeklyStats.matchedByMls += 1;
    } else {
      result.weeklyStats.matchedByAddress += 1;
    }
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
