import type { ReactNode } from "react";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatAccountNumber } from "@/lib/consumer/format-date";
import { domBadgeColor } from "@/lib/consumer/listing-stats";
import { formatCurrency } from "@/lib/crm/format";
import type { ListingOverviewMetrics } from "@/types/consumer-listing-detail";

type AccountDashboardStatsCardsProps = {
  metrics: ListingOverviewMetrics | null;
};

function MetricCard({
  label,
  value,
  chip,
}: {
  label: string;
  value: string;
  chip?: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {chip}
        </Stack>
      </Stack>
    </Paper>
  );
}

function formatMetricNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return formatAccountNumber(value);
}

export default function AccountDashboardStatsCards({
  metrics,
}: AccountDashboardStatsCardsProps) {
  const showingsOffersValue =
    metrics != null ? `${metrics.totalShowings} / ${metrics.offerCount}` : "—";

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard label="List price" value={formatCurrency(metrics?.listPrice)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Days on market"
          value={formatMetricNumber(metrics?.daysOnMarket)}
          chip={
            metrics?.daysOnMarket != null && metrics.marketAvgDom != null ? (
              <Chip
                label={`City avg ${metrics.marketAvgDom}`}
                size="small"
                color={domBadgeColor(metrics.daysOnMarket, metrics.marketAvgDom)}
                variant="outlined"
              />
            ) : null
          }
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Showings last week"
          value={formatMetricNumber(metrics?.showingsLastWeek)}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="New saves last week"
          value={formatMetricNumber(metrics?.newSavesLastWeek)}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard label="Webviews" value={formatMetricNumber(metrics?.webviews)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Average showings per week"
          value={
            metrics?.avgShowingsPerWeek != null
              ? metrics.avgShowingsPerWeek.toLocaleString("en-US", {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 0,
                })
              : "—"
          }
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard label="Showings / offers" value={showingsOffersValue} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Price reductions"
          value={formatMetricNumber(metrics?.priceReductionCount)}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Days since last drop"
          value={formatMetricNumber(metrics?.daysSinceLastDrop)}
        />
      </Grid>
    </Grid>
  );
}
