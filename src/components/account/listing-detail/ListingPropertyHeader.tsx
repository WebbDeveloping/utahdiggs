import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import {
  consumerListingStatusColor,
  formatConsumerListingStatus,
} from "@/lib/consumer/mls-draft";
import {
  daysOnMarket,
  domBadgeColor,
  weeksSinceListDate,
} from "@/lib/consumer/listing-stats";
import { formatAccountNumber } from "@/lib/consumer/format-date";
import { formatCurrency } from "@/lib/crm/format";
import type {
  ConsumerListingDetail,
  ListingOverviewMetrics,
} from "@/types/consumer-listing-detail";

type ListingPropertyHeaderProps = {
  listing: ConsumerListingDetail;
  metrics: ListingOverviewMetrics | null;
  customerName: string | null | undefined;
};

function propertyDetails(listing: ConsumerListingDetail): string {
  const parts: string[] = [];
  if (listing.beds) parts.push(`${listing.beds} bed`);
  if (listing.baths) parts.push(`${listing.baths} bath`);
  if (listing.sqft) parts.push(`${listing.sqft} sqft`);
  return parts.join(" · ");
}

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

export default function ListingPropertyHeader({
  listing,
  metrics,
  customerName,
}: ListingPropertyHeaderProps) {
  const firstName = customerName?.trim().split(/\s+/)[0];
  const weekNumber = weeksSinceListDate(listing.listDate);
  const details = propertyDetails(listing);

  const dom = metrics?.daysOnMarket ?? daysOnMarket(listing.listDate);
  const marketAvgDom = metrics?.marketAvgDom ?? listing.marketAvgDom;
  const listPrice = metrics?.listPrice ?? listing.listPrice;
  const showingsLastWeek = metrics?.showingsLastWeek;
  const newSavesLastWeek = metrics?.newSavesLastWeek ?? null;
  const webviews = metrics?.webviews ?? null;
  const avgShowingsPerWeek = metrics?.avgShowingsPerWeek ?? null;
  const totalShowings = metrics?.totalShowings;
  const offerCount = metrics?.offerCount;
  const priceReductionCount = metrics?.priceReductionCount ?? listing.priceReductionCount;
  const daysSinceLastDrop = metrics?.daysSinceLastDrop ?? null;

  const showingsOffersValue =
    totalShowings != null && offerCount != null
      ? `${totalShowings} / ${offerCount}`
      : "—";

  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href="/account/listings" style={{ color: "inherit", textDecoration: "none" }}>
          My listings
        </Link>
        <Typography color="text.primary">{listing.address}</Typography>
      </Breadcrumbs>

      <Stack spacing={1}>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
          {firstName ? `Hello, ${firstName}` : "Your listing"}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Chip
            label={formatConsumerListingStatus(listing)}
            color={consumerListingStatusColor(listing)}
            size="small"
          />
          {weekNumber != null && listing.status === "ACTIVE" ? (
            <Chip
              label={`Active Listing · Week ${weekNumber}`}
              size="small"
              variant="outlined"
            />
          ) : null}
        </Stack>
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {listing.address}
        </Typography>
        <Typography color="text.secondary">
          {listing.city}, {listing.state} {listing.zip}
          {details ? ` · ${details}` : ""}
        </Typography>
        {listing.mlsNumber ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            MLS# {listing.mlsNumber}
          </Typography>
        ) : null}
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard label="List price" value={formatCurrency(listPrice)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard
            label="Days on market"
            value={formatMetricNumber(dom)}
            chip={
              dom != null && marketAvgDom != null ? (
                <Chip
                  label={`City avg ${marketAvgDom}`}
                  size="small"
                  color={domBadgeColor(dom, marketAvgDom)}
                  variant="outlined"
                />
              ) : null
            }
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard
            label="Showings last week"
            value={formatMetricNumber(showingsLastWeek)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard
            label="New saves last week"
            value={formatMetricNumber(newSavesLastWeek)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard label="Webviews" value={formatMetricNumber(webviews)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard
            label="Average showings per week"
            value={
              avgShowingsPerWeek != null
                ? avgShowingsPerWeek.toLocaleString("en-US", {
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
            value={formatMetricNumber(priceReductionCount)}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
          <MetricCard
            label="Days since last drop"
            value={formatMetricNumber(daysSinceLastDrop)}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
