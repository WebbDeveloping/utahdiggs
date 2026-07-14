"use server";

import { revalidatePath } from "next/cache";
import { ListingStatus, SellerRequestStatus } from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import {
  resolveRequestedPrice,
  type ReductionOption,
} from "@/lib/consumer/price-reduction-options";
import { formatCurrency } from "@/lib/crm/format";
import { prisma } from "@/lib/db";

const REQUEST_ALLOWED_STATUSES: ListingStatus[] = [
  ListingStatus.ACTIVE,
  ListingStatus.UNDER_CONTRACT,
  ListingStatus.PENDING,
];

const REDUCTION_OPTIONS = new Set<ReductionOption>(["A", "B", "C"]);

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
      listPrice: true,
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

export async function submitPriceReductionAction(
  _prev: SellerRequestFormState,
  formData: FormData,
): Promise<SellerRequestFormState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to submit a request." };
  }

  const listingId = String(formData.get("listingId") ?? "").trim();
  const optionRaw = String(formData.get("reductionOption") ?? "").trim().toUpperCase();
  const customPriceRaw = String(formData.get("customPrice") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!listingId) {
    return { error: "Listing not found." };
  }

  if (!REDUCTION_OPTIONS.has(optionRaw as ReductionOption)) {
    return { error: "Please choose option A, B, or Custom." };
  }
  const reductionOption = optionRaw as ReductionOption;

  const listing = await getOwnedListing(session.id, listingId);
  if (!listing) {
    return { error: "Listing not found." };
  }

  if (listing.status !== ListingStatus.ACTIVE) {
    return { error: "Price changes are only available while your listing is active." };
  }

  const listPrice = listing.listPrice != null ? Number(listing.listPrice) : NaN;
  const resolved = resolveRequestedPrice(
    listPrice,
    reductionOption,
    reductionOption === "C" ? customPriceRaw : null,
  );
  if (!resolved.ok) {
    return { error: resolved.error };
  }

  const openExisting = await prisma.sellerRequest.findFirst({
    where: {
      listingId: listing.id,
      updateTypes: { has: "price_reduction" },
      status: { in: [SellerRequestStatus.NEW, SellerRequestStatus.IN_PROGRESS] },
    },
    select: { id: true },
  });
  if (openExisting) {
    return {
      error:
        "You already have an open price change request. We’ll update you when it’s complete.",
    };
  }

  const optionLabel = reductionOption === "C" ? "custom" : `option ${reductionOption}`;
  const requestSummary = `Price reduction: ${formatCurrency(listPrice)} → ${formatCurrency(resolved.newPrice)} (${optionLabel})`;

  try {
    await prisma.sellerRequest.create({
      data: {
        listingId: listing.id,
        sellerName: session.name?.trim() || session.email,
        sellerEmail: session.email,
        propertyAddress: fullAddress(listing),
        status: SellerRequestStatus.NEW,
        requestSummary,
        updateTypes: ["price_reduction"],
        message: message || null,
        currentPrice: listPrice,
        newPrice: resolved.newPrice,
        reductionOption,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/seller-requests");
    revalidatePath(`/account/listings/${listingId}`);
    return { success: true };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Request failed.";
    return { error: errMessage };
  }
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
