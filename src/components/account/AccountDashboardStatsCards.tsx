import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatAccountNumber } from "@/lib/consumer/format-date";
import type { AccountDashboardStats } from "@/types/consumer-account-data";

type AccountDashboardStatsProps = {
  stats: AccountDashboardStats;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default function AccountDashboardStatsCards({ stats }: AccountDashboardStatsProps) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Showings (30 days)" value={String(stats.showingsLast30Days)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Pending offers" value={String(stats.pendingOffers)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="Latest week views"
          value={
            stats.latestWeekViews != null ? formatAccountNumber(stats.latestWeekViews) : "—"
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Active listings" value={String(stats.activeListingCount)} />
      </Grid>
    </Grid>
  );
}
