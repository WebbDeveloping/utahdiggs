"use client";

import ListingDocumentsPanel from "@/components/account/listing-detail/ListingDocumentsPanel";
import type { ConsumerListingDocument } from "@/types/consumer-listing-detail";

type ListingDocumentsTabProps = {
  listingId: string;
  documents: ConsumerListingDocument[];
};

export default function ListingDocumentsTab({
  listingId,
  documents,
}: ListingDocumentsTabProps) {
  return <ListingDocumentsPanel listingId={listingId} documents={documents} />;
}
