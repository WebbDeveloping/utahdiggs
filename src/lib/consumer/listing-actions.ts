"use server";

import { redirect } from "next/navigation";
import { ListingStatus, SellInquiryStatus } from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { createListing } from "@/lib/crm/create-listing";
import { prisma } from "@/lib/db";
import { parseConsumerListingFormData } from "@/lib/consumer/listing-validation";
import type { CreateListingInput } from "@/types/crm-listing";
import type { ConsumerCreateListingState } from "@/types/consumer-listing";

function toCreateListingInput(
  input: ReturnType<typeof parseConsumerListingFormData>["input"],
): CreateListingInput {
  return {
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    listPrice: input.listPrice,
    beds: input.beds,
    baths: input.baths,
    sqft: input.sqft,
    description: input.description,
    sellerName: input.sellerName,
    sellerEmail: input.sellerEmail,
    sellerPhone: input.sellerPhone,
    coSellers: [],
    photos: input.photos,
    status: ListingStatus.SUBMITTED,
  };
}

export async function createConsumerListingAction(
  _prev: ConsumerCreateListingState,
  formData: FormData,
): Promise<ConsumerCreateListingState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to submit a listing." };
  }

  const { input, fieldErrors } = parseConsumerListingFormData(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let result;
  try {
    result = await createListing(toCreateListingInput(input), {
      customerId: session.id,
    });
  } catch (error) {
    console.error("createConsumerListingAction failed:", error);
    return { error: "Failed to submit listing. Please try again." };
  }

  const inquiryId = formData.get("inquiryId")?.toString().trim();
  if (inquiryId) {
    await prisma.sellInquiry.updateMany({
      where: {
        id: inquiryId,
        customerId: session.id,
      },
      data: {
        status: SellInquiryStatus.LISTING_SUBMITTED,
        listingId: result.listingId,
      },
    });
  }

  redirect(
    `/account/listings?submitted=${encodeURIComponent(result.listingSlug)}`,
  );
}
