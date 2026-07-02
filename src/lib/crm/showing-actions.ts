"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertCrmListingAccess } from "@/lib/crm/document-actions";

export type CrmShowingActionState = {
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

export async function saveShowingAction(
  _prev: CrmShowingActionState,
  formData: FormData,
): Promise<CrmShowingActionState> {
  const listingId = asString(formData.get("listingId"));
  const showingId = asString(formData.get("showingId"));
  const showingDate = parseDate(asString(formData.get("showingDate")));

  if (!listingId) {
    return { error: "Listing is required." };
  }
  if (!showingDate) {
    return { error: "Showing date is required." };
  }

  try {
    await assertCrmListingAccess(listingId);

    const data = {
      showingDate,
      showingTime: asString(formData.get("showingTime")) || null,
      showingLabel: asString(formData.get("showingLabel")) || null,
      buyersAgent: asString(formData.get("buyersAgent")) || null,
      feedback: asString(formData.get("feedback")) || null,
    };

    if (showingId) {
      const existing = await prisma.showing.findFirst({
        where: { id: showingId, listingId },
        select: { id: true },
      });
      if (!existing) {
        return { error: "Showing not found." };
      }
      await prisma.showing.update({
        where: { id: showingId },
        data,
      });
    } else {
      await prisma.showing.create({
        data: {
          listingId,
          ...data,
        },
      });
    }

    revalidatePath(`/crm/listings/${listingId}`);
    revalidatePath("/account/showings");
    revalidatePath("/account/this-weeks-report");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save showing.",
    };
  }
}

export async function deleteShowingAction(
  listingId: string,
  showingId: string,
): Promise<CrmShowingActionState> {
  if (!listingId || !showingId) {
    return { error: "Showing is required." };
  }

  try {
    await assertCrmListingAccess(listingId);

    const existing = await prisma.showing.findFirst({
      where: { id: showingId, listingId },
      select: { id: true },
    });
    if (!existing) {
      return { error: "Showing not found." };
    }

    await prisma.showing.delete({ where: { id: showingId } });

    revalidatePath(`/crm/listings/${listingId}`);
    revalidatePath("/account/showings");
    revalidatePath("/account/this-weeks-report");
    revalidatePath("/account");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete showing.",
    };
  }
}
