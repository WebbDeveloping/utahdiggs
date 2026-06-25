import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import CrmApproveListingButton from "@/components/crm/CrmApproveListingButton";
import CrmListingDetailTabs from "@/components/crm/CrmListingDetailTabs";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import {
  IntakeStatus,
  ListingStatus,
} from "@/generated/prisma/client";
import {
  formatCurrency,
  formatListingStatus,
  listingStatusColor,
} from "@/lib/crm/format";
import { MLS_INPUT_STEPS } from "@/lib/mls-input/schema";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type CrmListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CrmListingDetailPage({
  params,
}: CrmListingDetailPageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      listingIntake: true,
      contacts: { include: { contact: true } },
      documents: { orderBy: { uploadedAt: "asc" } },
      customer: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!listing) {
    notFound();
  }

  const intakeData = (listing.listingIntake?.data as Record<string, unknown>) ?? {};
  const isDraftIntake = listing.listingIntake?.status === IntakeStatus.DRAFT;
  const canApprove =
    listing.status === ListingStatus.SUBMITTED &&
    (!listing.listingIntake || listing.listingIntake.status === IntakeStatus.SUBMITTED);

  const primarySeller = listing.contacts.find((c) => c.role === "PRIMARY")?.contact;

  const summary = (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              label={formatListingStatus(listing.status)}
              color={listingStatusColor(listing.status)}
              size="small"
            />
            {listing.customerId ? (
              <Chip label="Consumer" size="small" variant="outlined" color="info" />
            ) : null}
            {isDraftIntake ? (
              <Chip label="MLS form in progress" size="small" variant="outlined" />
            ) : null}
            {listing.listingIntake?.status === IntakeStatus.SUBMITTED ? (
              <Chip label="Full MLS intake" size="small" variant="outlined" color="primary" />
            ) : null}
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Address
              </Typography>
              <Typography>
                {listing.address}, {listing.city}, {listing.state} {listing.zip}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                List price
              </Typography>
              <Typography>{formatCurrency(listing.listPrice?.toString())}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Portal slug
              </Typography>
              <Typography>{listing.portalSlug}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                MLS number
              </Typography>
              <Typography>{listing.mlsNumber ?? "—"}</Typography>
            </Grid>
            {primarySeller ? (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Primary seller
                </Typography>
                <Typography>
                  {primarySeller.name} · {primarySeller.email} · {primarySeller.phone}
                </Typography>
              </Grid>
            ) : null}
            {listing.description ? (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Description / remarks
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{listing.description}</Typography>
              </Grid>
            ) : null}
          </Grid>

          {canApprove ? (
            <Stack direction="row" spacing={1}>
              <CrmApproveListingButton
                listingId={listing.id}
                address={listing.address}
                portalSlug={listing.portalSlug}
              />
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      {listing.documents.length > 0 ? (
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Photos & documents
          </Typography>
          <Stack spacing={1}>
            {listing.documents.map((doc) => (
              <Typography key={doc.id} variant="body2">
                <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.name}
                </Link>
              </Typography>
            ))}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );

  return (
    <>
      <CrmPageHeader
        title={listing.address}
        description={`${listing.city}, ${listing.state} · ${formatCurrency(listing.listPrice?.toString())}`}
        action={
          <Link href="/crm/listings" style={{ textDecoration: "none" }}>
            <Typography color="primary">← Back to listings</Typography>
          </Link>
        }
      />

      <CrmListingDetailTabs
        steps={MLS_INPUT_STEPS}
        intakeData={intakeData}
        listing={{
          address: listing.address,
          city: listing.city,
          state: listing.state,
          zip: listing.zip,
        }}
        summary={summary}
      />
    </>
  );
}
