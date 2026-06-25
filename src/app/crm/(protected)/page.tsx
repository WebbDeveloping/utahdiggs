import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import CrmPageHeader from "@/components/crm/CrmPageHeader";
import CrmStatCard from "@/components/crm/CrmStatCard";
import { getPendingApprovalListingCount } from "@/lib/crm/listing-queries";

export default async function CrmDashboardPage() {
  const pendingApprovalCount = await getPendingApprovalListingCount();

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
            <Button color="inherit" size="small" component={Link} href="/crm/listings">
              Review
            </Button>
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
          <Button component={Link} href="/crm/listings" variant="outlined" size="small">
            View listings
          </Button>
        </Stack>
      ) : (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          More dashboard stats and quick actions will appear here as the CRM is built out.
        </Typography>
      )}
    </>
  );
}
