"use client";

import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { formatAddress, formatPrice } from "@/lib/search/format";
import type { PublicListing } from "@/types/public-listing";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

type MapListingPopupProps = {
  listing: PublicListing;
};

function formatDetail(value: string | null, label: string) {
  if (!value) return null;
  return `${value} ${label}`;
}

export default function MapListingPopup({ listing }: MapListingPopupProps) {
  const details = [
    formatDetail(listing.beds, "Bed"),
    formatDetail(listing.baths, "Bath"),
    formatDetail(listing.sqft, "Sq Ft"),
    listing.lotSizeAcres ? `${listing.lotSizeAcres} Acres` : null,
  ].filter(Boolean);

  return (
    <CardActionArea
      component={NextLink}
      href={`/homes/${listing.portalSlug}`}
      sx={{ display: "block", textAlign: "left" }}
    >
      <Box
        component="img"
        src={listing.primaryPhotoUrl ?? PLACEHOLDER_IMAGE}
        alt={formatAddress(listing)}
        sx={{
          display: "block",
          width: "100%",
          height: 120,
          objectFit: "cover",
        }}
      />
      <Stack spacing={0.75} sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {formatPrice(listing.listPrice)}
        </Typography>
        {details.length > 0 ? (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            {details.map((detail) => (
              <Typography key={detail} variant="caption" color="text.secondary">
                {detail}
              </Typography>
            ))}
          </Stack>
        ) : null}
        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
          {formatAddress(listing)}
        </Typography>
      </Stack>
    </CardActionArea>
  );
}
