import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DataFormPreviewViewer from "@/components/account/mls-input/DataFormPreviewViewer";
import LinkButton from "@/components/ui/LinkButton";
import { getConsumerSession } from "@/lib/auth/consumer-session";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Data Form PDF preview — Glide RE",
};

type DataFormPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DataFormPreviewPage({ params }: DataFormPreviewPageProps) {
  const user = await getConsumerSession();
  if (!user) return null;

  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, customerId: user.id },
    select: {
      id: true,
      address: true,
      city: true,
      state: true,
      zip: true,
    },
  });
  if (!listing) notFound();

  const mlsWizardHref = `/account/listings/new/mls-input?draft=${encodeURIComponent(listing.id)}`;

  return (
    <Stack spacing={3} sx={{ maxWidth: 960 }}>
      <Stack spacing={1}>
        <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Data Form PDF preview
        </Typography>
        <Typography color="text.secondary">
          {listing.address}, {listing.city}, {listing.state} {listing.zip}
        </Typography>
        <Typography color="text.secondary">
          Preview of the official property Data Form filled with your answers. Submitting your
          listing generates the final copy for our MLS team.
        </Typography>
      </Stack>

      <Alert severity="info">
        Preview only — this does not submit your listing. If you have not signed yet, signature and
        initials areas may show placeholders.
      </Alert>

      <DataFormPreviewViewer listingId={listing.id} />

      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
        <LinkButton href={mlsWizardHref} variant="contained">
          Back to MLS form
        </LinkButton>
        <LinkButton href="/account" color="inherit">
          Account home
        </LinkButton>
      </Stack>
    </Stack>
  );
}
