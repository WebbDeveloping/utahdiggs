"use server";

import { revalidatePath } from "next/cache";
import { OfferStatus } from "@/generated/prisma/client";
import { getActiveOfferListingBySlug } from "@/lib/offer/listing-query";
import { parseOfferSubmissionFormData } from "@/lib/offer/validation";
import { prisma } from "@/lib/db";
import { isAllowedOfferBlobUrl } from "@/lib/storage/blob";
import type { OfferSubmissionState } from "@/types/offer";

export async function submitOfferAction(
  _prev: OfferSubmissionState,
  formData: FormData,
): Promise<OfferSubmissionState> {
  const { input, fieldErrors, honeypotTriggered } =
    parseOfferSubmissionFormData(formData);

  if (honeypotTriggered) {
    return { success: true };
  }

  if (!input || Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const listing = await getActiveOfferListingBySlug(input.listingSlug);
  if (!listing) {
    return { error: "This property is not currently accepting offers." };
  }

  if (!isAllowedOfferBlobUrl(input.offerContractUrl, listing.id)) {
    return { fieldErrors: { offerContractUrl: "Invalid offer contract file." } };
  }

  if (!isAllowedOfferBlobUrl(input.preApprovalUrl, listing.id)) {
    return {
      fieldErrors: { preApprovalUrl: "Invalid pre-approval letter file." },
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          listingId: listing.id,
          status: OfferStatus.PENDING_REVIEW,
          offerPrice: input.offerPrice,
          buyersAgent: input.buyersAgent,
          financingType: input.financingType,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerPhone: input.buyerPhone,
          buyerAgentEmail: input.buyerAgentEmail,
          buyerAgentPhone: input.buyerAgentPhone,
          earnestMoney: input.earnestMoney,
          closingDate: input.closingDate,
          inspectionPeriod: input.inspectionPeriod,
          appraisalGap: input.appraisalGap,
          contingencies: input.contingencies,
          additionalTerms: input.additionalTerms,
        },
      });

      await tx.offerDocument.createMany({
        data: [
          {
            offerId: offer.id,
            name: "Offer contract",
            url: input.offerContractUrl,
          },
          {
            offerId: offer.id,
            name: "Pre-approval letter",
            url: input.preApprovalUrl,
          },
        ],
      });
    });

    try {
      const { sendOfferSubmittedEmail } = await import(
        "@/lib/email/templates/crm-notifications"
      );
      await sendOfferSubmittedEmail({
        listingId: listing.id,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        offerPrice: input.offerPrice.toString(),
        buyersAgent: input.buyersAgent,
        buyerName: input.buyerName ?? "Not provided",
      });
    } catch (emailError) {
      console.error("Offer notification email failed:", emailError);
    }

    revalidatePath(`/account/listings/${listing.id}`);
    return { success: true };
  } catch (error) {
    console.error("submitOfferAction failed:", error);
    return { error: "Failed to submit offer. Please try again." };
  }
}
