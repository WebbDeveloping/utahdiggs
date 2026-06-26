"use client";

import dynamic from "next/dynamic";
import DirectionsIcon from "@mui/icons-material/Directions";
import StreetviewIcon from "@mui/icons-material/Streetview";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { hasValidMapCoordinates } from "@/lib/search/format";
import type { PublicListingDetail } from "@/types/public-listing";

const ListingMiniMap = dynamic(() => import("@/components/search/ListingMiniMap"), {
  ssr: false,
});

type ListingMapSectionProps = {
  listing: PublicListingDetail;
};

function getDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

function getStreetViewUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
}

export default function ListingMapSection({ listing }: ListingMapSectionProps) {
  if (!hasValidMapCoordinates(listing)) {
    return (
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
    );
  }

  const { latitude, longitude } = listing;

  return (
    <Stack spacing={2}>
      <ListingMiniMap latitude={latitude} longitude={longitude} price={listing.listPrice} />
      <Stack direction="row" spacing={1.5}>
        <Button
          component="a"
          href={getDirectionsUrl(latitude, longitude)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<DirectionsIcon />}
          sx={{ flex: 1 }}
        >
          Directions
        </Button>
        <Button
          component="a"
          href={getStreetViewUrl(latitude, longitude)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<StreetviewIcon />}
          sx={{ flex: 1 }}
        >
          Street View
        </Button>
      </Stack>
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
  );
}
