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
import { formatCurrency } from "@/lib/crm/format";
import type { ConsumerListingDetail } from "@/types/consumer-listing-detail";

type ListingPropertyHeaderProps = {
  listing: ConsumerListingDetail;
  customerName: string | null | undefined;
};

function formatShortDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function propertyDetails(listing: ConsumerListingDetail): string {
  const parts: string[] = [];
  if (listing.beds) parts.push(`${listing.beds} bed`);
  if (listing.baths) parts.push(`${listing.baths} bath`);
  if (listing.sqft) parts.push(`${listing.sqft} sqft`);
  return parts.join(" · ");
}

export default function ListingPropertyHeader({
  listing,
  customerName,
}: ListingPropertyHeaderProps) {
  const firstName = customerName?.trim().split(/\s+/)[0];
  const dom = daysOnMarket(listing.listDate);
  const weekNumber = weeksSinceListDate(listing.listDate);
  const details = propertyDetails(listing);

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

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Stack spacing={2}>
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                List price
              </Typography>
              <Typography variant="h6">{formatCurrency(listing.listPrice)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                Days on market
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="h6">{dom ?? "—"}</Typography>
                {dom != null && listing.marketAvgDom != null ? (
                  <Chip
                    label={`City avg ${listing.marketAvgDom}`}
                    size="small"
                    color={domBadgeColor(dom, listing.marketAvgDom)}
                    variant="outlined"
                  />
                ) : null}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">
                List date
              </Typography>
              <Typography variant="h6">{formatShortDate(listing.listDate)}</Typography>
            </Grid>
            {listing.priceReductionCount > 0 ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Price reductions
                  </Typography>
                  <Typography>{listing.priceReductionCount}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last reduction
                  </Typography>
                  <Typography>{formatShortDate(listing.priceReductionDate)}</Typography>
                </Grid>
              </>
            ) : null}
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  );
}
