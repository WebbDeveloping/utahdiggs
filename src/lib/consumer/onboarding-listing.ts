import { ContactRole, ListingStatus, OnboardingStatus } from "@/generated/prisma/client";
import { generateListingPasscodeHash } from "@/lib/auth/portal-auth";
import { generateUniquePortalSlug } from "@/lib/crm/slug";
import { prisma } from "@/lib/db";

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export type CreateOnboardingListingInput = {
  customerId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  inquiryId?: string;
};

export async function createOnboardingListing(
  input: CreateOnboardingListingInput,
): Promise<{ listingId: string }> {
  const portalSlug = await generateUniquePortalSlug(input.address, input.city);
  const { passcodeHash } = await generateListingPasscodeHash(input.sellerPhone);
  const offerFormUrl = `${appBaseUrl()}/offer/${portalSlug}`;
  const sellerEmail = input.sellerEmail.trim().toLowerCase();

  const listing = await prisma.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        address: input.address.trim() || "New listing",
        city: input.city.trim() || "TBD",
        state: input.state.trim().toUpperCase() || "UT",
        zip: input.zip.trim() || "00000",
        status: ListingStatus.SUBMITTED,
        portalSlug,
        passcodeHash,
        offerFormUrl,
        customerId: input.customerId,
        submittedAt: null,
        onboardingStatus: OnboardingStatus.PLAN_PENDING,
      },
    });

    const contact = await tx.contact.upsert({
      where: { email: sellerEmail },
      update: {
        name: input.sellerName.trim(),
        phone: input.sellerPhone.trim(),
      },
      create: {
        email: sellerEmail,
        name: input.sellerName.trim(),
        phone: input.sellerPhone.trim(),
      },
    });

    await tx.listingContact.create({
      data: {
        listingId: created.id,
        contactId: contact.id,
        role: ContactRole.PRIMARY,
      },
    });

    return created;
  });

  if (input.inquiryId) {
    await prisma.sellInquiry.updateMany({
      where: { id: input.inquiryId, customerId: input.customerId },
      data: { listingId: listing.id },
    });
  }

  return { listingId: listing.id };
}
