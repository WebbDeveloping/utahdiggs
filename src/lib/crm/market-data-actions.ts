"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth/admin-auth";
import { canEditMarketData, getSessionUser } from "@/lib/crm/access";
import { prisma } from "@/lib/db";

export type MarketDataActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

async function requireMarketDataAdmin() {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user || !canEditMarketData(user)) {
    throw new Error("Unauthorized");
  }
  return user;
}

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalInt(
  raw: string,
  field: string,
  fieldErrors: Record<string, string>,
): number | null | undefined {
  if (!raw) return null;
  const num = Number(raw);
  if (!Number.isInteger(num) || num < 0) {
    fieldErrors[field] = "Enter a whole number (0 or greater).";
    return undefined;
  }
  return num;
}

function parseOptionalDecimal(
  raw: string,
  field: string,
  fieldErrors: Record<string, string>,
): number | null | undefined {
  if (!raw) return null;
  const num = Number(raw);
  if (Number.isNaN(num)) {
    fieldErrors[field] = "Enter a valid number.";
    return undefined;
  }
  return num;
}

function parseReportDate(
  raw: string,
  fieldErrors: Record<string, string>,
): Date | undefined {
  if (!raw) {
    fieldErrors.reportDate = "Report date is required.";
    return undefined;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    fieldErrors.reportDate = "Use YYYY-MM-DD format.";
    return undefined;
  }
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    fieldErrors.reportDate = "Enter a valid date.";
    return undefined;
  }
  return date;
}

type MetricFields = {
  homesForSale: number | null;
  homesForSaleChangePct: number | null;
  newToMarket: number | null;
  newToMarketChangePct: number | null;
  homesSoldCount: number | null;
  homesSoldChangePct: number | null;
  avgDom: number | null;
  domChangePct: number | null;
  avgHomePrice: number | null;
  avgHomePriceChangePct: number | null;
  avgSoldPrice: number | null;
  avgSoldPriceChangePct: number | null;
  pricePerSqFt: number | null;
  pricePerSqFtChangePct: number | null;
  priceReductionsCount: number | null;
  priceReductionsChangePct: number | null;
  soldToListedRatio: string | null;
  soldToListedChangePct: number | null;
};

function parseMetricFields(formData: FormData): {
  metrics?: MetricFields;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};

  const homesForSale = parseOptionalInt(
    asString(formData.get("homesForSale")),
    "homesForSale",
    fieldErrors,
  );
  const homesForSaleChangePct = parseOptionalDecimal(
    asString(formData.get("homesForSaleChangePct")),
    "homesForSaleChangePct",
    fieldErrors,
  );
  const newToMarket = parseOptionalInt(
    asString(formData.get("newToMarket")),
    "newToMarket",
    fieldErrors,
  );
  const newToMarketChangePct = parseOptionalDecimal(
    asString(formData.get("newToMarketChangePct")),
    "newToMarketChangePct",
    fieldErrors,
  );
  const homesSoldCount = parseOptionalInt(
    asString(formData.get("homesSoldCount")),
    "homesSoldCount",
    fieldErrors,
  );
  const homesSoldChangePct = parseOptionalDecimal(
    asString(formData.get("homesSoldChangePct")),
    "homesSoldChangePct",
    fieldErrors,
  );
  const avgDom = parseOptionalInt(
    asString(formData.get("avgDom")),
    "avgDom",
    fieldErrors,
  );
  const domChangePct = parseOptionalDecimal(
    asString(formData.get("domChangePct")),
    "domChangePct",
    fieldErrors,
  );
  const avgHomePrice = parseOptionalDecimal(
    asString(formData.get("avgHomePrice")),
    "avgHomePrice",
    fieldErrors,
  );
  const avgHomePriceChangePct = parseOptionalDecimal(
    asString(formData.get("avgHomePriceChangePct")),
    "avgHomePriceChangePct",
    fieldErrors,
  );
  const avgSoldPrice = parseOptionalDecimal(
    asString(formData.get("avgSoldPrice")),
    "avgSoldPrice",
    fieldErrors,
  );
  const avgSoldPriceChangePct = parseOptionalDecimal(
    asString(formData.get("avgSoldPriceChangePct")),
    "avgSoldPriceChangePct",
    fieldErrors,
  );
  const pricePerSqFt = parseOptionalDecimal(
    asString(formData.get("pricePerSqFt")),
    "pricePerSqFt",
    fieldErrors,
  );
  const pricePerSqFtChangePct = parseOptionalDecimal(
    asString(formData.get("pricePerSqFtChangePct")),
    "pricePerSqFtChangePct",
    fieldErrors,
  );
  const priceReductionsCount = parseOptionalInt(
    asString(formData.get("priceReductionsCount")),
    "priceReductionsCount",
    fieldErrors,
  );
  const priceReductionsChangePct = parseOptionalDecimal(
    asString(formData.get("priceReductionsChangePct")),
    "priceReductionsChangePct",
    fieldErrors,
  );
  const soldToListedRatio = asString(formData.get("soldToListedRatio")) || null;
  const soldToListedChangePct = parseOptionalDecimal(
    asString(formData.get("soldToListedChangePct")),
    "soldToListedChangePct",
    fieldErrors,
  );

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    fieldErrors,
    metrics: {
      homesForSale: homesForSale ?? null,
      homesForSaleChangePct: homesForSaleChangePct ?? null,
      newToMarket: newToMarket ?? null,
      newToMarketChangePct: newToMarketChangePct ?? null,
      homesSoldCount: homesSoldCount ?? null,
      homesSoldChangePct: homesSoldChangePct ?? null,
      avgDom: avgDom ?? null,
      domChangePct: domChangePct ?? null,
      avgHomePrice: avgHomePrice ?? null,
      avgHomePriceChangePct: avgHomePriceChangePct ?? null,
      avgSoldPrice: avgSoldPrice ?? null,
      avgSoldPriceChangePct: avgSoldPriceChangePct ?? null,
      pricePerSqFt: pricePerSqFt ?? null,
      pricePerSqFtChangePct: pricePerSqFtChangePct ?? null,
      priceReductionsCount: priceReductionsCount ?? null,
      priceReductionsChangePct: priceReductionsChangePct ?? null,
      soldToListedRatio,
      soldToListedChangePct: soldToListedChangePct ?? null,
    },
  };
}

function revalidateMarketData() {
  revalidatePath("/crm/market-data");
  revalidatePath("/account/your-market");
}

export async function createMarketDataAction(
  _prev: MarketDataActionState,
  formData: FormData,
): Promise<MarketDataActionState> {
  try {
    await requireMarketDataAdmin();
  } catch {
    return { error: "You are not authorized to edit market data." };
  }

  const city = asString(formData.get("city"));
  const fieldErrors: Record<string, string> = {};
  if (!city) fieldErrors.city = "City is required.";

  const reportDate = parseReportDate(asString(formData.get("reportDate")), fieldErrors);
  const { metrics, fieldErrors: metricErrors } = parseMetricFields(formData);
  Object.assign(fieldErrors, metricErrors);

  if (Object.keys(fieldErrors).length > 0 || !reportDate || !metrics) {
    return { fieldErrors };
  }

  try {
    await prisma.marketData.create({
      data: {
        city,
        reportDate,
        isManualOverride: true,
        airtableRecordId: null,
        ...metrics,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: {
          city: "A row for this city and report date already exists.",
        },
      };
    }
    throw error;
  }

  revalidateMarketData();
  return { success: `Created market data for ${city}.` };
}

export async function updateMarketDataAction(
  _prev: MarketDataActionState,
  formData: FormData,
): Promise<MarketDataActionState> {
  try {
    await requireMarketDataAdmin();
  } catch {
    return { error: "You are not authorized to edit market data." };
  }

  const id = asString(formData.get("id"));
  if (!id) return { error: "Missing market data id." };

  const city = asString(formData.get("city"));
  const fieldErrors: Record<string, string> = {};
  if (!city) fieldErrors.city = "City is required.";

  const reportDate = parseReportDate(asString(formData.get("reportDate")), fieldErrors);
  const { metrics, fieldErrors: metricErrors } = parseMetricFields(formData);
  Object.assign(fieldErrors, metricErrors);

  if (Object.keys(fieldErrors).length > 0 || !reportDate || !metrics) {
    return { fieldErrors };
  }

  const existing = await prisma.marketData.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return { error: "Market data row not found." };
  }

  try {
    await prisma.marketData.update({
      where: { id },
      data: {
        city,
        reportDate,
        isManualOverride: true,
        ...metrics,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: {
          city: "A row for this city and report date already exists.",
        },
      };
    }
    throw error;
  }

  revalidateMarketData();
  return { success: `Updated market data for ${city}.` };
}

export async function clearMarketDataOverrideAction(
  id: string,
): Promise<MarketDataActionState> {
  try {
    await requireMarketDataAdmin();
  } catch {
    return { error: "You are not authorized to edit market data." };
  }

  const trimmedId = id.trim();
  if (!trimmedId) return { error: "Missing market data id." };

  const existing = await prisma.marketData.findUnique({
    where: { id: trimmedId },
    select: { id: true, city: true, isManualOverride: true },
  });
  if (!existing) {
    return { error: "Market data row not found." };
  }
  if (!existing.isManualOverride) {
    return { error: "This row is not locked as a manual override." };
  }

  await prisma.marketData.update({
    where: { id: trimmedId },
    data: { isManualOverride: false },
  });

  revalidateMarketData();
  return {
    success: `Cleared override for ${existing.city}. Next Airtable sync can update it.`,
  };
}
