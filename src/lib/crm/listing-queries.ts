import { IntakeStatus, ListingStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function getPendingApprovalListingCount() {
  return prisma.listing.count({
    where: {
      status: ListingStatus.SUBMITTED,
      NOT: {
        listingIntake: {
          status: IntakeStatus.DRAFT,
        },
      },
    },
  });
}
