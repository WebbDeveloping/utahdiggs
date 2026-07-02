import { prisma } from "@/lib/db";
import type { ConsumerListingDocument } from "@/types/consumer-listing-detail";

export type CustomerListingDocuments = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  agreementSignedAt: Date | null;
  documents: ConsumerListingDocument[];
};

export async function getCustomerListingDocuments(
  customerId: string,
  listingId: string,
): Promise<CustomerListingDocuments | null> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, customerId },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
      agreementSignedAt: true,
      documents: {
        orderBy: { uploadedAt: "desc" },
        select: {
          id: true,
          name: true,
          url: true,
          uploadedAt: true,
        },
      },
    },
  });

  return listing;
}
