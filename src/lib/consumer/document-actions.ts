"use server";

import { revalidatePath } from "next/cache";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";

export type CreateListingDocumentState = {
  error?: string;
  success?: boolean;
};

async function assertListingOwnership(customerId: string, listingId: string) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId },
    select: { id: true },
  });
  if (!listing) {
    throw new Error("Listing not found.");
  }
}

export async function createListingDocumentAction(
  _prev: CreateListingDocumentState,
  formData: FormData,
): Promise<CreateListingDocumentState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to upload documents." };
  }

  const listingId = String(formData.get("listingId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!listingId || !name || !url) {
    return { error: "Document name and file are required." };
  }

  try {
    await assertListingOwnership(session.id, listingId);
    await prisma.document.create({
      data: {
        listingId,
        name,
        url,
      },
    });
    revalidatePath(`/account/listings/${listingId}`);
    revalidatePath(`/account/listings/${listingId}/documents`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return { error: message };
  }
}
