import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import LinkButton from "@/components/ui/LinkButton";
import CrmStatCard from "@/components/crm/CrmStatCard";
import { auth } from "@/lib/auth/admin-auth";
import { requireCrmUser } from "@/lib/crm/access";
import { getUpcomingCallCount } from "@/lib/crm/call-queries";
import { getPendingApprovalListingCount } from "@/lib/crm/listing-queries";

export default async function CrmDashboardPage() {
  const session = await auth();
  const user = requireCrmUser(session);
  const [pendingApprovalCount, upcomingCallCount] = await Promise.all([
    getPendingApprovalListingCount(user),
    getUpcomingCallCount(user, { days: 7 }),
  ]);

  return (
    <>
      <CrmPageHeader
        title="Dashboard"
        description="Overview of active listings, pending offers, and seller requests."
      />

      {pendingApprovalCount > 0 ? (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <LinkButton color="inherit" size="small" href="/crm/listings">
              Review
            </LinkButton>
          }
        >
          {pendingApprovalCount} listing{pendingApprovalCount === 1 ? "" : "s"} awaiting
          approval.
        </Alert>
      ) : null}

      {upcomingCallCount > 0 ? (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <LinkButton color="inherit" size="small" href="/crm/calls">
              View calls
            </LinkButton>
          }
        >
          {upcomingCallCount} onboarding call{upcomingCallCount === 1 ? "" : "s"} scheduled in
          the next 7 days.
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CrmStatCard
            label="Awaiting approval"
            value={pendingApprovalCount}
            hint={
              pendingApprovalCount > 0
                ? "Consumer submissions ready for review"
                : "No listings need approval"
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <CrmStatCard
            label="Upcoming calls"
            value={upcomingCallCount}
            hint={
              upcomingCallCount > 0
                ? "Scheduled onboarding calls in the next 7 days"
                : "No calls scheduled this week"
            }
          />
        </Grid>
      </Grid>

      {pendingApprovalCount > 0 || upcomingCallCount > 0 ? (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {pendingApprovalCount > 0 ? (
            <LinkButton href="/crm/listings" variant="outlined" size="small">
              View listings
            </LinkButton>
          ) : null}
          {upcomingCallCount > 0 ? (
            <LinkButton href="/crm/calls" variant="outlined" size="small">
              View upcoming calls
            </LinkButton>
          ) : null}
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          More dashboard stats and quick actions will appear here as the CRM is built out.
        </Typography>
      )}
    </>
  );
}
