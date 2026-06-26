"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  formatEstimatedPayment,
  formatPricePerSqft,
} from "@/lib/search/listing-pricing";
import { formatPrice, getStatusLabel } from "@/lib/search/format";
import type { PublicListing } from "@/types/public-listing";

type ListingHeroProps = {
  listing: PublicListing;
};

function formatStat(value: string | number, label: string): string {
  return `${value} ${label}`;
}

export default function ListingHero({ listing }: ListingHeroProps) {
  const statusLabel = getStatusLabel(listing.status);
  const pricePerSqft = formatPricePerSqft(listing.listPrice, listing.sqft);
  const estimatedPayment = formatEstimatedPayment(listing.listPrice);

  const stats: string[] = [];
  if (listing.beds) stats.push(formatStat(listing.beds, "Bed"));
  if (listing.baths) stats.push(formatStat(listing.baths, "Bath"));
  if (listing.sqft) stats.push(formatStat(listing.sqft, "Sq Ft"));
  if (listing.lotSizeAcres != null) stats.push(formatStat(listing.lotSizeAcres, "Acres"));
  if (listing.yearBuilt) stats.push(`Built ${listing.yearBuilt}`);

  const locationChips: string[] = [];
  if (listing.neighborhood) locationChips.push(listing.neighborhood);
  if (listing.subdivision) locationChips.push(listing.subdivision);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "flex-start" },
          gap: 3,
        }}
      >
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {statusLabel ? (
            <Chip
              label={statusLabel}
              color={statusLabel === "Contingent" ? "warning" : "success"}
              variant="outlined"
              sx={{ alignSelf: "flex-start" }}
            />
          ) : null}
          <Typography variant="h1" sx={{ fontSize: { xs: "1.75rem", md: "2.5rem" }, lineHeight: 1.2 }}>
            {listing.address}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            {listing.city}, {listing.state} {listing.zip}
          </Typography>
          {stats.length > 0 ? (
            <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", pt: 0.5 }}>
              {stats.map((stat) => (
                <Typography key={stat} variant="body1" sx={{ fontWeight: 500 }}>
                  {stat}
                </Typography>
              ))}
            </Stack>
          ) : null}
          {locationChips.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", pt: 0.5 }}>
              {locationChips.map((chip) => (
                <Chip key={chip} label={chip} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : null}
        </Stack>

        <Stack spacing={0.5} sx={{ flexShrink: 0, alignItems: { xs: "flex-start", md: "flex-end" } }}>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.75rem", md: "2.25rem" }, lineHeight: 1.2 }}>
            {formatPrice(listing.listPrice)}
          </Typography>
          {estimatedPayment ? (
            <Typography variant="body1" color="text.secondary">
              Est. Payment: {estimatedPayment}
            </Typography>
          ) : null}
          {pricePerSqft ? (
            <Typography variant="body2" color="text.secondary">
              {pricePerSqft}
            </Typography>
          ) : null}
          {estimatedPayment ? (
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 280, textAlign: { md: "right" } }}>
              Estimate for principal &amp; interest only. Excludes taxes, insurance, and HOA.
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  );
}
