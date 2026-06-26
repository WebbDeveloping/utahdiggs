import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { notFound } from "next/navigation";
import OfferSubmissionForm from "@/components/offer/OfferSubmissionForm";
import SitePageLayoutWithAuth from "@/components/layout/SitePageLayoutWithAuth";
import { getOfferFormListing } from "@/lib/offer/listing-query";
import { createPageMetadata } from "@/lib/seo/metadata";

type OfferPageProps = {
  params: Promise<{ slug: string }>;
};

function formatAddress(listing: {
  address: string;
  city: string;
  state: string;
  zip: string;
}): string {
  return `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
}

export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getOfferFormListing(slug);

  if (result.kind === "not_found") {
    return createPageMetadata({
      title: "Offer Not Found",
      description: "This offer form could not be found.",
      path: `/offer/${slug}`,
      noIndex: true,
    });
  }

  const address = formatAddress(result.listing);

  return createPageMetadata({
    title: `Submit Offer — ${address}`,
    description: `Submit an offer for ${address}.`,
    path: `/offer/${slug}`,
    noIndex: true,
  });
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const result = await getOfferFormListing(slug);

  if (result.kind === "not_found") {
    notFound();
  }

  return (
    <SitePageLayoutWithAuth>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
              Submit an offer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              For buyer&apos;s agents submitting an offer on behalf of a client.
            </Typography>
          </Stack>

          {result.kind === "not_accepting" ? (
            <Alert severity="warning">
              This property is not currently accepting offers.
            </Alert>
          ) : (
            <OfferSubmissionForm listing={result.listing} />
          )}
        </Stack>
      </Container>
    </SitePageLayoutWithAuth>
  );
}
