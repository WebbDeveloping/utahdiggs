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
import CrmShowingsSection from "@/components/crm/CrmShowingsSection";
import CrmWeeklyStatsSection from "@/components/crm/CrmWeeklyStatsSection";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import {
  IntakeStatus,
} from "@/generated/prisma/client";
import {
  formatCurrency,
  formatListingStatus,
  formatScheduledCallAt,
  listingStatusColor,
} from "@/lib/crm/format";
import { formatOnboardingStatus, formatServicePlan } from "@/lib/consumer/onboarding";
import { MLS_INPUT_STEPS } from "@/lib/mls-input/schema";
import { auth } from "@/lib/auth/admin-auth";
import { isAdmin } from "@/lib/auth/roles";
import { canApproveListing, requireCrmUser } from "@/lib/crm/access";
import { getDefaultMlsVaUserId } from "@/lib/crm/mls-ops-settings";
import { getActiveAgents, getCrmListingById } from "@/lib/crm/listing-queries";
import { getCrmShowings } from "@/lib/crm/showing-queries";
import { getCrmWeeklyStats } from "@/lib/crm/weekly-stat-queries";
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
  const defaultVaUserId = await getDefaultMlsVaUserId();
  const showApprove =
    canApproveListing(user, listing, defaultVaUserId) &&
    (!listing.listingIntake || listing.listingIntake.status === IntakeStatus.SUBMITTED);

  const agents = isAdmin(user.role) ? await getActiveAgents() : [];

  const [showings, weeklyStats] = await Promise.all([
    getCrmShowings(listing.id),
    getCrmWeeklyStats(listing.id),
  ]);

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
            {listing.onboardingStatus !== "ONBOARDING_COMPLETE" && !listing.submittedAt ? (
              <Chip
                key="onboarding"
                label={formatOnboardingStatus(listing.onboardingStatus)}
                size="small"
                variant="outlined"
                color="warning"
              />
            ) : null}
            {listing.servicePlan ? (
              <Chip
                key="plan"
                label={formatServicePlan(listing.servicePlan)}
                size="small"
                variant="outlined"
              />
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
            <Grid key="listing-slug" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Listing slug
              </Typography>
              <Typography>{listing.listingSlug}</Typography>
            </Grid>
            <Grid key="mls-number" size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                MLS number
              </Typography>
              <Typography>{listing.mlsNumber ?? "—"}</Typography>
            </Grid>
            {listing.scheduledCallAt ? (
              <Grid key="scheduled-call" size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Onboarding call requested
                </Typography>
                <Typography>{formatScheduledCallAt(listing.scheduledCallAt)}</Typography>
                {listing.callNotes ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {listing.callNotes}
                  </Typography>
                ) : null}
              </Grid>
            ) : null}
            {listing.proPhotoTourRequested ? (
              <Grid key="photo-tour" size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Photo tour
                </Typography>
                <Typography>Professional tour requested</Typography>
              </Grid>
            ) : null}
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
                listingSlug={listing.listingSlug}
              />
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      <CrmListingMediaSection listingId={listing.id} documents={listing.documents} />

      <CrmShowingsSection
        listingId={listing.id}
        listingAddress={`${listing.address}, ${listing.city}`}
        showings={showings}
      />

      <CrmWeeklyStatsSection
        listingId={listing.id}
        listingAddress={`${listing.address}, ${listing.city}`}
        stats={weeklyStats}
      />
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
