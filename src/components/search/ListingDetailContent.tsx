"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import {
  formatAddress,
  formatPrice,
  getStatusLabel,
  hasValidMapCoordinates,
} from "@/lib/search/format";
import type { PublicListingDetail } from "@/types/public-listing";

const ListingMiniMap = dynamic(() => import("@/components/search/ListingMiniMap"), {
  ssr: false,
});

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

type ListingDetailContentProps = {
  listing: PublicListingDetail;
};

export default function ListingDetailContent({ listing }: ListingDetailContentProps) {
  const statusLabel = getStatusLabel(listing.status);
  const photos =
    listing.photos.length > 0
      ? listing.photos
      : [{ id: "placeholder", name: "Home", url: PLACEHOLDER_IMAGE }];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Button component={NextLink} href="/search" sx={{ alignSelf: "flex-start", px: 0 }}>
            Back to search
          </Button>
          {statusLabel ? (
            <Chip label={statusLabel} color="warning" variant="outlined" sx={{ alignSelf: "flex-start" }} />
          ) : null}
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
            {formatPrice(listing.listPrice)}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {formatAddress(listing)}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 1,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={photos[0].url}
            alt={photos[0].name}
            sx={{ width: "100%", height: { xs: 280, md: 420 }, objectFit: "cover" }}
          />
          <Stack spacing={1}>
            {photos.slice(1, 3).map((photo) => (
              <Box
                key={photo.id}
                component="img"
                src={photo.url}
                alt={photo.name}
                sx={{ width: "100%", height: { xs: 136, md: 206 }, objectFit: "cover" }}
              />
            ))}
          </Stack>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                {listing.beds ? <Chip label={`${listing.beds} Bed`} variant="outlined" /> : null}
                {listing.baths ? <Chip label={`${listing.baths} Bath`} variant="outlined" /> : null}
                {listing.sqft ? <Chip label={`${listing.sqft} Sq Ft`} variant="outlined" /> : null}
                {listing.lotSizeAcres ? (
                  <Chip label={`${listing.lotSizeAcres} Acres`} variant="outlined" />
                ) : null}
                {listing.yearBuilt ? (
                  <Chip label={`Built ${listing.yearBuilt}`} variant="outlined" />
                ) : null}
              </Stack>

              {listing.description ? (
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                  {listing.description}
                </Typography>
              ) : null}

              {listing.listingOffice ? (
                <Typography variant="body2" color="text.secondary">
                  Listing Office: {listing.listingOffice}
                </Typography>
              ) : null}

              {listing.mlsNumber ? (
                <Typography variant="caption" color="text.secondary">
                  MLS #{listing.mlsNumber}
                </Typography>
              ) : null}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              {hasValidMapCoordinates(listing) ? (
                <ListingMiniMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  price={listing.listPrice}
                />
              ) : null}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h6">Interested in this home?</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Talk to your dedicated Glide RE agent about scheduling a showing or making an offer.
                  </Typography>
                  <Button component={NextLink} href="/#contact" variant="contained" size="large">
                    Contact an agent
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
