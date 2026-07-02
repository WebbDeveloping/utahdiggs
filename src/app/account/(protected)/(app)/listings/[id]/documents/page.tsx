import type { Metadata } from "next";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ListingDocumentsPanel from "@/components/account/listing-detail/ListingDocumentsPanel";
import LinkButton from "@/components/ui/LinkButton";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { getCustomerListingDocuments } from "@/lib/consumer/listing-documents-query";
import { buildOnboardingPathForListing } from "@/lib/consumer/listing-prefill";
import { getListingResumePath } from "@/lib/consumer/mls-draft";
import { getCustomerListings } from "@/lib/consumer/listings-query";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Listing documents — Glide RE",
};

type ListingDocumentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDocumentsPage({ params }: ListingDocumentsPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await getCustomerListingDocuments(user.id, id);
  if (!listing) notFound();

  const allListings = await getCustomerListings(user.id);
  const summary = allListings.find((item) => item.id === id);
  const backHref = summary ? getListingResumePath(summary) : buildOnboardingPathForListing(id);

  return (
    <Stack spacing={4} sx={{ maxWidth: 720 }}>
      <Stack spacing={1}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Listing documents
        </Typography>
        <Typography color="text.secondary">
          {listing.address}, {listing.city}, {listing.state} {listing.zip}
        </Typography>
      </Stack>

      <ListingDocumentsPanel
        listingId={listing.id}
        documents={listing.documents}
        description="View your signed listing agreement, MLS paperwork, and other transaction documents."
      />

      <Stack direction="row" spacing={2}>
        <LinkButton href="/account/listings" color="inherit">
          My listings
        </LinkButton>
        <LinkButton href={backHref} variant="outlined">
          Back to listing
        </LinkButton>
      </Stack>
    </Stack>
  );
}
