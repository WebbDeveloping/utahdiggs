import { prisma } from "@/lib/db";
import { isListingAgreementDocument } from "@/lib/documents/listing-document-kinds";
import { partitionListingDocuments } from "@/lib/storage/document-classify";
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

export type CustomerListingDocumentGroup = CustomerListingDocuments;

function sortListingDocuments(documents: ConsumerListingDocument[]): ConsumerListingDocument[] {
  return [...documents].sort((a, b) => {
    const aAgreement = isListingAgreementDocument(a.name);
    const bAgreement = isListingAgreementDocument(b.name);
    if (aAgreement !== bAgreement) {
      return aAgreement ? -1 : 1;
    }

    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
  });
}

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

export async function getCustomerDocumentsByListing(
  customerId: string,
): Promise<CustomerListingDocumentGroup[]> {
  const listings = await prisma.listing.findMany({
    where: { customerId },
    orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
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

  return listings
    .map((listing) => ({
      ...listing,
      documents: sortListingDocuments(partitionListingDocuments(listing.documents).otherDocuments),
    }))
    .filter((listing) => listing.documents.length > 0);
}
