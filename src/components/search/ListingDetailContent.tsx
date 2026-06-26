"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import type { PublicListingDetail } from "@/types/public-listing";
import ListingAgentContactBar from "@/components/search/ListingAgentContactBar";
import ListingHero from "@/components/search/ListingHero";
import ListingMapSection from "@/components/search/ListingMapSection";
import ListingMlsCompliance from "@/components/search/ListingMlsCompliance";
import ListingPhotoGallery from "@/components/search/ListingPhotoGallery";
import ListingPropertyDetails from "@/components/search/ListingPropertyDetails";

type ListingDetailContentProps = {
  listing: PublicListingDetail;
};

export default function ListingDetailContent({ listing }: ListingDetailContentProps) {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Button component={NextLink} href="/search" sx={{ alignSelf: "flex-start", px: 0 }}>
          Back to search
        </Button>

        <ListingHero listing={listing} />

        <ListingPhotoGallery
          photos={listing.photos}
          virtualTourUrl={listing.virtualTourUrl}
          address={listing.address}
        />

        <ListingAgentContactBar listing={listing} />

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            {listing.description ? (
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                {listing.description}
              </Typography>
            ) : null}
            <ListingPropertyDetails
              sections={listing.propertyDetails}
              sx={{ mt: listing.description ? 3 : 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <ListingMapSection listing={listing} />
          </Grid>
        </Grid>

        <ListingMlsCompliance listing={listing} />
      </Stack>
    </Container>
  );
}
