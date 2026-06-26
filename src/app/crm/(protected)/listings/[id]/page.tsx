import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import CrmApproveListingButton from "@/components/crm/CrmApproveListingButton";
import CrmAssignAgentSelect from "@/components/crm/CrmAssignAgentSelect";
import CrmListingDetailTabs from "@/components/crm/CrmListingDetailTabs";
import CrmListingMediaSection from "@/components/crm/CrmListingMediaSection";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import {
  IntakeStatus,
} from "@/generated/prisma/client";
import {
  formatCurrency,
  formatListingStatus,
  listingStatusColor,
} from "@/lib/crm/format";
import { MLS_INPUT_STEPS } from "@/lib/mls-input/schema";
import { auth } from "@/lib/auth/admin-auth";
import { isAdmin } from "@/lib/auth/roles";
import { canApproveListing, requireCrmUser } from "@/lib/crm/access";
import { getActiveAgents, getCrmListingById } from "@/lib/crm/listing-queries";
import { notFound } from "next/navigation";

type CrmListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CrmListingDetailPage({
  params,
}: CrmListingDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const user = requireCrmUser(session);

  const listing = await getCrmListingById(user, id);

  if (!listing) {
    notFound();
  }

  const intakeData = (listing.listingIntake?.data as Record<string, unknown>) ?? {};
  const isDraftIntake = listing.listingIntake?.status === IntakeStatus.DRAFT;
  const showApprove =
    canApproveListing(user, listing) &&
    (!listing.listingIntake || listing.listingIntake.status === IntakeStatus.SUBMITTED);

  const agents = isAdmin(user.role) ? await getActiveAgents() : [];

  const primarySeller = listing.contacts.find((c) => c.role === "PRIMARY")?.contact;

  const summary = (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              key="status"
              label={formatListingStatus(listing.status)}
              color={listingStatusColor(listing.status)}
              size="small"
            />
            {listing.customerId ? (
              <Chip key="consumer" label="Consumer" size="small" variant="outlined" color="info" />
            ) : null}
            {isDraftIntake ? (
              <Chip key="draft-intake" label="MLS form in progress" size="small" variant="outlined" />
            ) : null}
            {listing.listingIntake?.status === IntakeStatus.SUBMITTED ? (
              <Chip key="submitted-intake" label="Full MLS intake" size="small" variant="outlined" color="primary" />
            ) : null}
          </Stack>

          <Grid container spacing={2}>
            <Grid key="address" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Address
              </Typography>
              <Typography>
                {listing.address}, {listing.city}, {listing.state} {listing.zip}
              </Typography>
            </Grid>
            <Grid key="list-price" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                List price
              </Typography>
              <Typography>{formatCurrency(listing.listPrice?.toString())}</Typography>
            </Grid>
            <Grid key="portal-slug" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Portal slug
              </Typography>
              <Typography>{listing.portalSlug}</Typography>
            </Grid>
            <Grid key="mls-number" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                MLS number
              </Typography>
              <Typography>{listing.mlsNumber ?? "—"}</Typography>
            </Grid>
            <Grid key="assigned-agent" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Assigned agent
              </Typography>
              {isAdmin(user.role) ? (
                <Box sx={{ mt: 0.5 }}>
                  <CrmAssignAgentSelect
                    listingId={listing.id}
                    currentAgentId={listing.assignedAgentId}
                    agents={agents}
                  />
                </Box>
              ) : (
                <Typography>
                  {listing.assignedAgent?.name ??
                    listing.assignedAgent?.email ??
                    "—"}
                </Typography>
              )}
            </Grid>
            {primarySeller ? (
              <Grid key="primary-seller" size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Primary seller
                </Typography>
                <Typography>
                  {primarySeller.name} · {primarySeller.email} · {primarySeller.phone}
                </Typography>
              </Grid>
            ) : null}
            {listing.description ? (
              <Grid key="description" size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Description / remarks
                </Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{listing.description}</Typography>
              </Grid>
            ) : null}
          </Grid>

          {showApprove ? (
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

      <CrmListingMediaSection listingId={listing.id} documents={listing.documents} />
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
