import type { ReactNode } from "react";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatAccountDate, formatAccountNumber } from "@/lib/consumer/format-date";
import { domBadgeColor } from "@/lib/consumer/coaching-rules";
import { formatCurrency } from "@/lib/crm/format";
import type { ListingOverviewMetrics } from "@/types/consumer-listing-detail";

type AccountDashboardStatsCardsProps = {
  metrics: ListingOverviewMetrics | null;
};

function MetricCard({
  label,
  value,
  chip,
  hint,
}: {
  label: string;
  value: string;
  chip?: ReactNode;
  hint?: string;
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
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
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
    metrics != null
      ? `${metrics.totalShowings} / ${metrics.pendingOfferCount}`
      : "—";

  const reductionsHint =
    metrics != null &&
    metrics.priceReductionCount > 0 &&
    metrics.priceReductionDate
      ? `Last reduced ${formatAccountDate(metrics.priceReductionDate)}`
      : undefined;

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
          hint={
            metrics != null ? `Total ${formatMetricNumber(metrics.totalShowings)}` : undefined
          }
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Pending offers"
          value={formatMetricNumber(metrics?.pendingOfferCount)}
          hint={
            metrics != null
              ? `${formatMetricNumber(metrics.offerCount)} total submitted`
              : undefined
          }
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard label="Webviews" value={formatMetricNumber(metrics?.webviews)} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Saves"
          value={formatMetricNumber(metrics?.latestSaves ?? metrics?.newSavesLastWeek)}
          hint={
            metrics?.newSavesLastWeek != null
              ? `+${formatAccountNumber(metrics.newSavesLastWeek)} last week`
              : undefined
          }
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <MetricCard
          label="Showings / pending offers"
          value={showingsOffersValue}
        />
      </Grid>
      {metrics != null && metrics.priceReductionCount > 0 ? (
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard
            label="Price reductions"
            value={formatMetricNumber(metrics.priceReductionCount)}
            hint={reductionsHint}
          />
        </Grid>
      ) : null}
    </Grid>
  );
}
