import { ContactRole, IntakeStatus, ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { SellerListingScopeItem } from "@/types/consumer-account-data";

const SELLER_ACCOUNT_STATUSES: ListingStatus[] = [
  ListingStatus.SUBMITTED,
  ListingStatus.ACTIVE,
  ListingStatus.UNDER_CONTRACT,
  ListingStatus.PENDING,
  ListingStatus.CLOSED,
];

const listingSelect = {
  id: true,
  address: true,
  city: true,
  state: true,
  listPrice: true,
  listDate: true,
  blairNote: true,
  blairNoteDate: true,
} as const;

function mapListing(listing: {
  id: string;
  address: string;
  city: string;
  state: string;
  listPrice: { toString(): string } | null;
  listDate: Date | null;
  blairNote: string | null;
  blairNoteDate: Date | null;
}): SellerListingScopeItem {
  return {
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    listPrice: listing.listPrice?.toString() ?? null,
    listDate: listing.listDate,
    blairNote: listing.blairNote,
    blairNoteDate: listing.blairNoteDate,
  };
}

export async function getSellerListingsScope(
  customerId: string,
  email: string,
): Promise<{ listingIds: string[]; listings: SellerListingScopeItem[] }> {
  const normalizedEmail = email.trim().toLowerCase();

  const [ownedListings, contactListings] = await Promise.all([
    prisma.listing.findMany({
      where: {
        customerId,
        status: { in: SELLER_ACCOUNT_STATUSES },
        OR: [
          { listingIntake: null },
          { listingIntake: { status: { not: IntakeStatus.DRAFT } } },
        ],
      },
      select: listingSelect,
    }),
    prisma.listing.findMany({
      where: {
        status: { in: SELLER_ACCOUNT_STATUSES },
        OR: [
          { listingIntake: null },
          { listingIntake: { status: { not: IntakeStatus.DRAFT } } },
        ],
        contacts: {
          some: {
            role: { in: [ContactRole.PRIMARY, ContactRole.CO_SELLER] },
            contact: { email: normalizedEmail },
          },
        },
      },
      select: listingSelect,
    }),
  ]);

  const byId = new Map<string, SellerListingScopeItem>();
  for (const listing of [...ownedListings, ...contactListings]) {
    byId.set(listing.id, mapListing(listing));
  }

  const listings = Array.from(byId.values()).sort((a, b) =>
    a.address.localeCompare(b.address),
  );

  return {
    listingIds: listings.map((listing) => listing.id),
    listings,
  };
}
