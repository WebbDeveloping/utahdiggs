import { ContactRole, ListingStatus } from "@/generated/prisma/client";
import { generateListingPasscodeHash } from "@/lib/auth/portal-auth";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";
import { generateUniquePortalSlug } from "@/lib/crm/slug";
import type { CreateListingInput } from "@/types/crm-listing";

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export type CreateListingResult = {
  listingId: string;
  portalSlug: string;
  passcode: string;
};

export type CreateListingOptions = {
  userId?: string;
  customerId?: string;
};

export async function createListing(
  input: CreateListingInput,
  options: CreateListingOptions = {},
): Promise<CreateListingResult> {
  const { userId, customerId } = options;
  const sellerEmail = input.sellerEmail.trim().toLowerCase();
  const portalSlug = await generateUniquePortalSlug(input.address, input.city);
  const { passcode, passcodeHash } = await generateListingPasscodeHash(
    input.sellerPhone,
  );
  const offerFormUrl = `${appBaseUrl()}/offer/${portalSlug}`;
  const isSubmitted = input.status === ListingStatus.SUBMITTED;

  const listing = await prisma.$transaction(async (tx) => {
    const primaryContact = await tx.contact.upsert({
      where: { email: sellerEmail },
      update: {
        name: input.sellerName.trim(),
        phone: input.sellerPhone.trim(),
      },
      create: {
        name: input.sellerName.trim(),
        email: sellerEmail,
        phone: input.sellerPhone.trim(),
      },
    });

    const created = await tx.listing.create({
      data: {
        address: input.address.trim(),
        city: input.city.trim(),
        state: input.state.trim().toUpperCase(),
        zip: input.zip.trim(),
        listPrice: input.listPrice ?? null,
        beds: input.beds?.trim() || null,
        baths: input.baths?.trim() || null,
        sqft: input.sqft?.trim() || null,
        mlsNumber: input.mlsNumber?.trim() || null,
        listDate: isSubmitted ? null : (input.listDate ?? new Date()),
        status: input.status,
        portalSlug,
        passcodeHash,
        offerFormUrl,
        yearBuilt: input.yearBuilt ?? null,
        lotSizeAcres: input.lotSizeAcres ?? null,
        neighborhood: input.neighborhood?.trim() || null,
        subdivision: input.subdivision?.trim() || null,
        hasPool: input.hasPool ?? null,
        listingOffice: input.listingOffice?.trim() || null,
        virtualTourUrl: input.virtualTourUrl?.trim() || null,
        description: input.description?.trim() || null,
        escrowOfficerId: input.escrowOfficerId || null,
        transactionCoordinatorId: input.transactionCoordinatorId || null,
        portfolioGroup: input.portfolioGroup?.trim() || null,
        customerId: customerId ?? null,
        submittedAt: isSubmitted ? new Date() : null,
      },
    });

    await tx.listingContact.create({
      data: {
        listingId: created.id,
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
          listingId_contactId: {
            listingId: created.id,
            contactId: coContact.id,
          },
        },
        update: { role: ContactRole.CO_SELLER },
        create: {
          listingId: created.id,
          contactId: coContact.id,
          role: ContactRole.CO_SELLER,
        },
      });
    }

    if (input.photos.length > 0) {
      await tx.document.createMany({
        data: input.photos.map((photo) => ({
          listingId: created.id,
          name: photo.name.trim(),
          url: photo.url.trim(),
          uploadedByUserId: userId ?? null,
        })),
      });
    }

    return created;
  });

  try {
    const query = `${input.address.trim()}, ${input.city.trim()}, ${input.state.trim()} ${input.zip.trim()}`;
    const coords = await geocodeAddress(query);
    if (coords) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
    }
  } catch {
    // Geocoding is best-effort; listing creation still succeeds.
  }

  return {
    listingId: listing.id,
    portalSlug,
    passcode,
  };
}
