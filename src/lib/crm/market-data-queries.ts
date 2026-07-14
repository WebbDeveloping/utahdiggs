import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type MarketDataAdminRow = {
  id: string;
  city: string;
  reportDate: string;
  isManualOverride: boolean;
  airtableRecordId: string | null;
  homesForSale: number | null;
  homesForSaleChangePct: string | null;
  newToMarket: number | null;
  newToMarketChangePct: string | null;
  homesSoldCount: number | null;
  homesSoldChangePct: string | null;
  avgDom: number | null;
  domChangePct: string | null;
  avgHomePrice: string | null;
  avgHomePriceChangePct: string | null;
  avgSoldPrice: string | null;
  avgSoldPriceChangePct: string | null;
  pricePerSqFt: string | null;
  pricePerSqFtChangePct: string | null;
  priceReductionsCount: number | null;
  priceReductionsChangePct: string | null;
  soldToListedRatio: string | null;
  soldToListedChangePct: string | null;
  updatedAt: string;
};

function decimalToString(value: { toString(): string } | null | undefined): string | null {
  return value == null ? null : value.toString();
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function serializeRow(row: {
  id: string;
  city: string;
  reportDate: Date;
  isManualOverride: boolean;
  airtableRecordId: string | null;
  homesForSale: number | null;
  homesForSaleChangePct: { toString(): string } | null;
  newToMarket: number | null;
  newToMarketChangePct: { toString(): string } | null;
  homesSoldCount: number | null;
  homesSoldChangePct: { toString(): string } | null;
  avgDom: number | null;
  domChangePct: { toString(): string } | null;
  avgHomePrice: { toString(): string } | null;
  avgHomePriceChangePct: { toString(): string } | null;
  avgSoldPrice: { toString(): string } | null;
  avgSoldPriceChangePct: { toString(): string } | null;
  pricePerSqFt: { toString(): string } | null;
  pricePerSqFtChangePct: { toString(): string } | null;
  priceReductionsCount: number | null;
  priceReductionsChangePct: { toString(): string } | null;
  soldToListedRatio: string | null;
  soldToListedChangePct: { toString(): string } | null;
  updatedAt: Date;
}): MarketDataAdminRow {
  return {
    id: row.id,
    city: row.city,
    reportDate: toDateInputValue(row.reportDate),
    isManualOverride: row.isManualOverride,
    airtableRecordId: row.airtableRecordId,
    homesForSale: row.homesForSale,
    homesForSaleChangePct: decimalToString(row.homesForSaleChangePct),
    newToMarket: row.newToMarket,
    newToMarketChangePct: decimalToString(row.newToMarketChangePct),
    homesSoldCount: row.homesSoldCount,
    homesSoldChangePct: decimalToString(row.homesSoldChangePct),
    avgDom: row.avgDom,
    domChangePct: decimalToString(row.domChangePct),
    avgHomePrice: decimalToString(row.avgHomePrice),
    avgHomePriceChangePct: decimalToString(row.avgHomePriceChangePct),
    avgSoldPrice: decimalToString(row.avgSoldPrice),
    avgSoldPriceChangePct: decimalToString(row.avgSoldPriceChangePct),
    pricePerSqFt: decimalToString(row.pricePerSqFt),
    pricePerSqFtChangePct: decimalToString(row.pricePerSqFtChangePct),
    priceReductionsCount: row.priceReductionsCount,
    priceReductionsChangePct: decimalToString(row.priceReductionsChangePct),
    soldToListedRatio: row.soldToListedRatio,
    soldToListedChangePct: decimalToString(row.soldToListedChangePct),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const marketDataSelect = {
  id: true,
  city: true,
  reportDate: true,
  isManualOverride: true,
  airtableRecordId: true,
  homesForSale: true,
  homesForSaleChangePct: true,
  newToMarket: true,
  newToMarketChangePct: true,
  homesSoldCount: true,
  homesSoldChangePct: true,
  avgDom: true,
  domChangePct: true,
  avgHomePrice: true,
  avgHomePriceChangePct: true,
  avgSoldPrice: true,
  avgSoldPriceChangePct: true,
  pricePerSqFt: true,
  pricePerSqFtChangePct: true,
  priceReductionsCount: true,
  priceReductionsChangePct: true,
  soldToListedRatio: true,
  soldToListedChangePct: true,
  updatedAt: true,
} as const;

export type MarketDataListFilters = {
  city?: string;
  reportDate?: string;
};

export async function getMarketDataCities(): Promise<string[]> {
  const rows = await prisma.marketData.findMany({
    distinct: ["city"],
    orderBy: { city: "asc" },
    select: { city: true },
  });
  return rows.map((row) => row.city);
}

export async function getMarketDataReportDates(): Promise<string[]> {
  const rows = await prisma.marketData.findMany({
    distinct: ["reportDate"],
    orderBy: { reportDate: "desc" },
    select: { reportDate: true },
    take: 52,
  });
  return rows.map((row) => toDateInputValue(row.reportDate));
}

export async function getMarketDataRows(
  filters: MarketDataListFilters = {},
): Promise<MarketDataAdminRow[]> {
  const where: Prisma.MarketDataWhereInput = {};

  const city = filters.city?.trim();
  if (city) {
    where.city = city;
  }

  const reportDate = filters.reportDate?.trim();
  if (reportDate) {
    where.reportDate = new Date(`${reportDate}T00:00:00.000Z`);
  }

  const rows = await prisma.marketData.findMany({
    where,
    orderBy: [{ reportDate: "desc" }, { city: "asc" }],
    take: reportDate || city ? 200 : 100,
    select: marketDataSelect,
  });

  return rows.map(serializeRow);
}
