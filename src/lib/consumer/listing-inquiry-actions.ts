"use server";

import { prisma } from "@/lib/db";
import { parseListingInquiryFormData } from "@/lib/consumer/listing-inquiry-validation";
import { sendListingInquiryEmail } from "@/lib/email/templates/listing-inquiry";
import { PUBLIC_LISTING_STATUSES } from "@/lib/search/search-params";

export type ListingInquiryState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitListingInquiryAction(
  _prev: ListingInquiryState,
  formData: FormData,
): Promise<ListingInquiryState> {
  const { input, fieldErrors } = parseListingInquiryFormData(formData);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const listing = await prisma.listing.findFirst({
    where: {
      id: input.listingId,
      status: { in: [...PUBLIC_LISTING_STATUSES] },
    },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
    },
  });

  if (!listing) {
    return { error: "This listing is no longer available." };
  }

  try {
    await sendListingInquiryEmail({
      listingId: listing.id,
      type: input.type,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      preferredDate: input.preferredDate,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send request.";
    return { error: message };
  }

  return { success: true };
}
