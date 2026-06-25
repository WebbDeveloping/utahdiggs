"use server";

import { IntakeStatus } from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type DeleteMlsDraftResult = {
  success?: boolean;
  error?: string;
};

export async function deleteMlsDraftAction(
  listingId: string,
): Promise<DeleteMlsDraftResult> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to discard a draft." };
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId: session.id },
    include: { listingIntake: true },
  });

  if (!listing?.listingIntake) {
    return { error: "Draft not found." };
  }

  if (listing.listingIntake.status !== IntakeStatus.DRAFT) {
    return { error: "Only in-progress MLS forms can be discarded." };
  }

  try {
    await prisma.listing.delete({ where: { id: listingId } });

    revalidatePath("/account");
    revalidatePath("/account/listings");
    revalidatePath("/account/listings/new/mls-input");

    return { success: true };
  } catch (error) {
    console.error("deleteMlsDraftAction failed:", error);
    return { error: "Failed to discard draft. Please try again." };
  }
}
