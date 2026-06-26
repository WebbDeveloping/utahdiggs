import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import LinkButton from "@/components/ui/LinkButton";
import CrmStatCard from "@/components/crm/CrmStatCard";
import { auth } from "@/lib/auth/admin-auth";
import { requireCrmUser } from "@/lib/crm/access";
import { getPendingApprovalListingCount } from "@/lib/crm/listing-queries";

export default async function CrmDashboardPage() {
  const session = await auth();
  const user = requireCrmUser(session);
  const pendingApprovalCount = await getPendingApprovalListingCount(user);

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
      </Grid>

      {pendingApprovalCount > 0 ? (
        <Stack direction="row" sx={{ mt: 2 }}>
          <LinkButton href="/crm/listings" variant="outlined" size="small">
            View listings
          </LinkButton>
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          More dashboard stats and quick actions will appear here as the CRM is built out.
        </Typography>
      )}
    </>
  );
}
