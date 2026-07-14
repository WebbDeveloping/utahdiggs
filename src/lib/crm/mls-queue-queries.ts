import { IntakeStatus, ListingStatus } from "@/generated/prisma/client";
import {
  getDefaultMlsVaUserId,
} from "@/lib/crm/mls-ops-settings";
import {
  getMlsQueueWhereForUser,
  type CrmSessionUser,
} from "@/lib/crm/access";
import { prisma } from "@/lib/db";

export type MlsQueueListing = {
  id: string;
  address: string;
  city: string;
  state: string;
  listingSlug: string;
  mlsNumber: string | null;
  submittedAt: Date | null;
  intakeSubmittedAt: Date | null;
  sellerName: string;
  assignedAgent: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export async function getMlsQueueListings(
  user: CrmSessionUser,
): Promise<MlsQueueListing[]> {
  const defaultVaUserId = await getDefaultMlsVaUserId();

  const listings = await prisma.listing.findMany({
    where: {
      ...getMlsQueueWhereForUser(user, defaultVaUserId),
      status: ListingStatus.SUBMITTED,
      listingIntake: { status: IntakeStatus.SUBMITTED },
    },
    orderBy: [
      { listingIntake: { submittedAt: "asc" } },
      { submittedAt: "asc" },
    ],
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      listingSlug: true,
      mlsNumber: true,
      submittedAt: true,
      listingIntake: { select: { submittedAt: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
      contacts: {
        where: { role: "PRIMARY" },
        take: 1,
        select: { contact: { select: { name: true, email: true } } },
      },
      customer: { select: { name: true, email: true } },
    },
  });

  return listings.map((listing) => {
    const primary = listing.contacts[0]?.contact;
    const sellerName =
      primary?.name?.trim() ||
      listing.customer?.name?.trim() ||
      primary?.email ||
      listing.customer?.email ||
      "Seller";

    return {
      id: listing.id,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      listingSlug: listing.listingSlug,
      mlsNumber: listing.mlsNumber,
      submittedAt: listing.submittedAt,
      intakeSubmittedAt: listing.listingIntake?.submittedAt ?? null,
      sellerName,
      assignedAgent: listing.assignedAgent,
    };
  });
}
