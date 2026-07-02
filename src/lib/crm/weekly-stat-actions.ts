"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertCrmListingAccess } from "@/lib/crm/document-actions";
import { parseOptionalInt } from "@/lib/crm/manual-entry-utils";

export type CrmWeeklyStatActionState = {
  error?: string;
  success?: boolean;
};

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function saveWeeklyStatAction(
  _prev: CrmWeeklyStatActionState,
  formData: FormData,
): Promise<CrmWeeklyStatActionState> {
  const listingId = asString(formData.get("listingId"));
  const weekEnding = parseDate(asString(formData.get("weekEnding")));

  if (!listingId) {
    return { error: "Listing is required." };
  }
  if (!weekEnding) {
    return { error: "Week ending date is required." };
  }

  const data = {
    listtracTotal30d: parseOptionalInt(asString(formData.get("listtracTotal30d"))),
    ureViews30d: parseOptionalInt(asString(formData.get("ureViews30d"))),
    zillowViews30d: parseOptionalInt(asString(formData.get("zillowViews30d"))),
    realtorViews30d: parseOptionalInt(asString(formData.get("realtorViews30d"))),
    homesViews30d: parseOptionalInt(asString(formData.get("homesViews30d"))),
    truliaViews30d: parseOptionalInt(asString(formData.get("truliaViews30d"))),
    ureFavoritesCumulative: parseOptionalInt(asString(formData.get("ureFavoritesCumulative"))),
    lifetimeViews: parseOptionalInt(asString(formData.get("lifetimeViews"))),
  };

  try {
    await assertCrmListingAccess(listingId);

    await prisma.weeklyStat.upsert({
      where: {
        listingId_weekEnding: {
          listingId,
          weekEnding,
        },
      },
      create: {
        listingId,
        weekEnding,
        ...data,
      },
      update: data,
    });

    revalidatePath(`/crm/listings/${listingId}`);
    revalidatePath("/account/web-traffic");
    revalidatePath("/account/this-weeks-report");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save weekly stats.",
    };
  }
}

export async function deleteWeeklyStatAction(
  listingId: string,
  weeklyStatId: string,
): Promise<CrmWeeklyStatActionState> {
  if (!listingId || !weeklyStatId) {
    return { error: "Weekly stat is required." };
  }

  try {
    await assertCrmListingAccess(listingId);

    const existing = await prisma.weeklyStat.findFirst({
      where: { id: weeklyStatId, listingId },
      select: { id: true },
    });
    if (!existing) {
      return { error: "Weekly stat not found." };
    }

    await prisma.weeklyStat.delete({ where: { id: weeklyStatId } });

    revalidatePath(`/crm/listings/${listingId}`);
    revalidatePath("/account/web-traffic");
    revalidatePath("/account/this-weeks-report");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete weekly stat.",
    };
  }
}
