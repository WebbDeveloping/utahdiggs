"use server";

import { redirect } from "next/navigation";
import {
  ContactRole,
  IntakeStatus,
  ListingStatus,
  OnboardingStatus,
  SellInquiryStatus,
} from "@/generated/prisma/client";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { geocodeListingAddress } from "@/lib/geocode";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { sendMlsIntakeSubmittedEmail } from "@/lib/email/templates/mls-intake-submitted";
import { mapMlsIntakeToListingInput } from "./map-to-listing";
import { validateFullMlsInput } from "./validation";
import type { MlsSubmitState } from "./types";

export async function submitMlsIntakeAction(
  _prev: MlsSubmitState,
  formData: FormData,
): Promise<MlsSubmitState> {
  const session = await getConsumerSession();
  if (!session) {
    return { error: "You must be signed in to submit." };
  }

  const listingId = formData.get("listingId")?.toString().trim();
  const valuesJson = formData.get("values")?.toString();

  if (!listingId || !valuesJson) {
    return { error: "Missing submission data." };
  }

  let values: Record<string, unknown>;
  try {
    values = JSON.parse(valuesJson) as Record<string, unknown>;
  } catch {
    return { error: "Invalid form data." };
  }

  const validation = validateFullMlsInput(values);
  if (!validation.success) {
    return { fieldErrors: validation.fieldErrors };
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId: session.id },
    include: { listingIntake: true },
  });

  if (!listing?.listingIntake) {
    return { error: "Listing draft not found." };
  }

  const input = mapMlsIntakeToListingInput(validation.data);
  const signatureUrl =
    (values["q20-signature"] as string | undefined) ||
    listing.listingIntake.signatureUrl ||
    null;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.listing.update({
        where: { id: listingId },
        data: {
          address: input.address,
          city: input.city,
          state: input.state,
          zip: input.zip,
          listPrice: input.listPrice ?? null,
          beds: input.beds ?? null,
          baths: input.baths ?? null,
          sqft: input.sqft ?? null,
          yearBuilt: input.yearBuilt ?? null,
          lotSizeAcres: input.lotSizeAcres ?? null,
          hasPool: input.hasPool ?? null,
          description: input.description ?? null,
          status: ListingStatus.SUBMITTED,
          submittedAt: new Date(),
          onboardingStatus: OnboardingStatus.ONBOARDING_COMPLETE,
        },
      });

      const primaryContact = await tx.contact.upsert({
        where: { email: input.sellerEmail.toLowerCase() },
        update: {
          name: input.sellerName,
          phone: input.sellerPhone,
        },
        create: {
          name: input.sellerName,
          email: input.sellerEmail.toLowerCase(),
          phone: input.sellerPhone,
        },
      });

      await tx.listingContact.upsert({
        where: {
          listingId_contactId: {
            listingId,
            contactId: primaryContact.id,
          },
        },
        update: { role: ContactRole.PRIMARY },
        create: {
          listingId,
          contactId: primaryContact.id,
          role: ContactRole.PRIMARY,
        },
      });

      for (const coSeller of input.coSellers) {
        const coEmail = coSeller.email.trim().toLowerCase();
        const coContact = await tx.contact.upsert({
          where: { email: coEmail },
          update: {
            name: coSeller.name?.trim() || coEmail,
            phone: coSeller.phone?.trim() || "",
          },
          create: {
            name: coSeller.name?.trim() || coEmail,
            email: coEmail,
            phone: coSeller.phone?.trim() || "",
          },
        });

        await tx.listingContact.upsert({
          where: {
            listingId_contactId: { listingId, contactId: coContact.id },
          },
          update: { role: ContactRole.CO_SELLER },
          create: {
            listingId,
            contactId: coContact.id,
            role: ContactRole.CO_SELLER,
          },
        });
      }

      await tx.document.deleteMany({
        where: { listingId, name: { in: ["Photo", "MLS Input Signature"] } },
      });

      if (input.photos.length > 0) {
        await tx.document.createMany({
          data: input.photos.map((photo) => ({
            listingId,
            name: photo.name.trim(),
            url: photo.url.trim(),
          })),
        });
      }

      if (signatureUrl) {
        await tx.document.create({
          data: {
            listingId,
            name: "MLS Input Signature",
            url: signatureUrl,
          },
        });
      }

      await tx.listingIntake.update({
        where: { listingId },
        data: {
          status: IntakeStatus.SUBMITTED,
          data: values as Prisma.InputJsonValue,
          signatureUrl,
          submittedAt: new Date(),
          currentStep: 16,
        },
      });
    });

    try {
      const coords = await geocodeListingAddress({
        address: input.address,
        city: input.city,
        state: input.state,
        zip: input.zip,
      });
      if (coords) {
        await prisma.listing.update({
          where: { id: listingId },
          data: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        });
      }
    } catch {
      // best-effort geocoding
    }

    const inquiryId = values.inquiryId as string | undefined;
    if (inquiryId) {
      await prisma.sellInquiry.updateMany({
        where: { id: inquiryId, customerId: session.id },
        data: {
          status: SellInquiryStatus.LISTING_SUBMITTED,
          listingId,
        },
      });
    }

    try {
      await sendMlsIntakeSubmittedEmail({
        listingId,
        address: input.address,
        city: input.city,
        state: input.state,
        sellerName: input.sellerName,
        offerFormUrl: listing.offerFormUrl ?? undefined,
      });
    } catch (emailError) {
      console.error("MLS intake notification email failed:", emailError);
    }

    redirect(`/account/onboarding/${listingId}?submitted=1`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("submitMlsIntakeAction failed:", error);
    return { error: "Failed to submit listing. Please try again." };
  }
}
