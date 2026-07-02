import { ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { OfferFormListing } from "@/types/offer";

export type OfferFormListingResult =
  | { kind: "found"; listing: OfferFormListing }
  | { kind: "not_accepting"; listing: OfferFormListing }
  | { kind: "not_found" };

function toOfferFormListing(listing: {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  listPrice: { toString(): string } | null;
  mlsNumber: string | null;
  listingSlug: string;
  status: ListingStatus;
}): OfferFormListing {
  return {
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
    listPrice: listing.listPrice?.toString() ?? null,
    mlsNumber: listing.mlsNumber,
    listingSlug: listing.listingSlug,
    status: listing.status,
  };
}

export async function getOfferFormListing(
  slug: string,
): Promise<OfferFormListingResult> {
  const listing = await prisma.listing.findFirst({
    where: { listingSlug: slug },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      listPrice: true,
      mlsNumber: true,
      listingSlug: true,
      status: true,
    },
  });

  if (!listing) {
    return { kind: "not_found" };
  }

  const mapped = toOfferFormListing(listing);

  if (listing.status !== ListingStatus.ACTIVE) {
    return { kind: "not_accepting", listing: mapped };
  }

  return { kind: "found", listing: mapped };
}

export async function getActiveOfferListingBySlug(
  slug: string,
): Promise<OfferFormListing | null> {
  const result = await getOfferFormListing(slug);
  return result.kind === "found" ? result.listing : null;
}
