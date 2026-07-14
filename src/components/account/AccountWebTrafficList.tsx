import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AccountEmptyState from "@/components/account/AccountEmptyState";
import PortalBreakdownChart from "@/components/account/charts/PortalBreakdownChart";
import WeeklyViewsChart from "@/components/account/charts/WeeklyViewsChart";
import { formatAccountDate, formatAccountNumber } from "@/lib/consumer/format-date";
import {
  portalBreakdownForListing,
  type PortalBreakdownChartData,
  type ViewsTrendChartData,
} from "@/lib/consumer/web-traffic-chart-data";
import type { ConsumerWeeklyStatRow } from "@/types/consumer-account-data";

type AccountWebTrafficListProps = {
  stats: ConsumerWeeklyStatRow[];
  viewsTrend: ViewsTrendChartData | null;
  portalBreakdowns: PortalBreakdownChartData[];
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}

export default function AccountWebTrafficList({
  stats,
  viewsTrend,
  portalBreakdowns,
}: AccountWebTrafficListProps) {
  if (stats.length === 0) {
    return (
      <AccountEmptyState
        title="No traffic data yet"
        description="Weekly listing views from Listtrac will appear here once your property is active on the MLS."
        hint="Traffic data typically updates weekly."
      />
    );
  }

  return (
    <Stack spacing={3}>
      {viewsTrend ? <WeeklyViewsChart data={viewsTrend} /> : null}

      {stats.map((stat) => {
        const portalChart = portalBreakdownForListing(portalBreakdowns, stat.listingId);

        return (
          <Paper key={stat.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ justifyContent: "space-between" }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stat.listingAddress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.listingCity}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Week ending {formatAccountDate(stat.weekEnding)}
                </Typography>
              </Stack>

              {portalChart ? <PortalBreakdownChart data={portalChart} /> : null}

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem
                    label="Listtrac total (30d)"
                    value={formatAccountNumber(stat.listtracTotal30d)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem label="URE views" value={formatAccountNumber(stat.ureViews30d)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem label="Zillow views" value={formatAccountNumber(stat.zillowViews30d)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem
                    label="Realtor.com views"
                    value={formatAccountNumber(stat.realtorViews30d)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem
                    label="Homes.com views"
                    value={formatAccountNumber(stat.homesViews30d)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem label="Trulia views" value={formatAccountNumber(stat.truliaViews30d)} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem
                    label="URE favorites"
                    value={formatAccountNumber(stat.ureFavoritesCumulative)}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <StatItem label="Lifetime views" value={formatAccountNumber(stat.lifetimeViews)} />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
