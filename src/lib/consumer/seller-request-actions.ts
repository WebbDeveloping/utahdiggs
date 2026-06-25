"use server";

import { revalidatePath } from "next/cache";
import { ListingStatus, SellerRequestStatus } from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";

const REQUEST_ALLOWED_STATUSES: ListingStatus[] = [
  ListingStatus.ACTIVE,
  ListingStatus.UNDER_CONTRACT,
  ListingStatus.PENDING,
];

export type SellerRequestFormState = {
  error?: string;
  success?: boolean;
};

async function getOwnedListing(customerId: string, listingId: string) {
  return prisma.listing.findFirst({
    where: { id: listingId, customerId },
    select: {
      id: true,
      status: true,
      address: true,
      city: true,
      state: true,
      zip: true,
    },
  });
}

function fullAddress(listing: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): string {
  return `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
}

export async function submitDescriptionUpdateAction(
  _prev: SellerRequestFormState,
  formData: FormData,
): Promise<SellerRequestFormState> {
  return submitSellerRequest(formData, "description", (message) => ({
    updateTypes: ["description"],
    message,
    requestSummary: "Description update request",
  }));
}

export async function submitOpenHouseRequestAction(
  _prev: SellerRequestFormState,
  formData: FormData,
): Promise<SellerRequestFormState> {
  const openHouseDateRaw = String(formData.get("openHouseDate") ?? "").trim();
  const openHouseTime = String(formData.get("openHouseTime") ?? "").trim();

  if (!openHouseDateRaw) {
    return { error: "Please choose an open house date." };
  }

  const openHouseDate = new Date(openHouseDateRaw);
  if (Number.isNaN(openHouseDate.getTime())) {
    return { error: "Invalid open house date." };
  }

  const formattedDate = openHouseDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return submitSellerRequest(formData, "open_house", () => ({
    updateTypes: ["open_house"],
    openHouseDate,
    openHouseTime: openHouseTime || null,
    requestSummary: `Open house request for ${formattedDate}`,
  }));
}

export async function submitMessageBlairAction(
  _prev: SellerRequestFormState,
  formData: FormData,
): Promise<SellerRequestFormState> {
  const message = String(formData.get("message") ?? "").trim();
  if (!message) {
    return { error: "Please enter a message." };
  }

  return submitSellerRequest(formData, "message", (msg) => ({
    updateTypes: ["message"],
    message: msg,
    requestSummary: "Message from seller",
  }));
}

async function submitSellerRequest(
  formData: FormData,
  _type: string,
  buildFields: (message: string) => {
    updateTypes: string[];
    message?: string;
    openHouseDate?: Date;
    openHouseTime?: string | null;
    requestSummary: string;
  },
): Promise<SellerRequestFormState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to submit a request." };
  }

  const listingId = String(formData.get("listingId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!listingId) {
    return { error: "Listing not found." };
  }

  const listing = await getOwnedListing(session.id, listingId);
  if (!listing) {
    return { error: "Listing not found." };
  }

  if (!REQUEST_ALLOWED_STATUSES.includes(listing.status)) {
    return {
      error: "Requests are available once your listing is active.",
    };
  }

  const fields = buildFields(message);

  try {
    await prisma.sellerRequest.create({
      data: {
        listingId: listing.id,
        sellerName: session.name?.trim() || session.email,
        sellerEmail: session.email,
        propertyAddress: fullAddress(listing),
        status: SellerRequestStatus.NEW,
        requestSummary: fields.requestSummary,
        updateTypes: fields.updateTypes,
        message: fields.message,
        openHouseDate: fields.openHouseDate,
        openHouseTime: fields.openHouseTime,
      },
    });

    revalidatePath(`/account/listings/${listingId}`);
    return { success: true };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Request failed.";
    return { error: errMessage };
  }
}
