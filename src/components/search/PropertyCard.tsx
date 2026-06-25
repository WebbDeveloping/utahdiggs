"use client";

import { useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import {
  formatAddress,
  formatPrice,
  getStatusLabel,
} from "@/lib/search/format";
import { isFavoriteListing, toggleFavoriteListing } from "@/lib/search/saved-searches";
import type { PublicListing } from "@/types/public-listing";

type PropertyCardProps = {
  listing: PublicListing;
  highlighted: boolean;
  cardRef?: (element: HTMLDivElement | null) => void;
  onHover: (id: string | null) => void;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

export default function PropertyCard({
  listing,
  highlighted,
  cardRef,
  onHover,
}: PropertyCardProps) {
  const [favorited, setFavorited] = useState(() => isFavoriteListing(listing.id));
  const statusLabel = getStatusLabel(listing.status);

  return (
    <Card
      ref={cardRef}
      variant="outlined"
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
      sx={{
        borderColor: highlighted ? "primary.main" : "divider",
        boxShadow: highlighted ? "0 0 0 2px rgba(15,81,50,0.15)" : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardActionArea component={NextLink} href={`/homes/${listing.portalSlug}`}>
          <CardMedia
            component="img"
            height="180"
            image={listing.primaryPhotoUrl ?? PLACEHOLDER_IMAGE}
            alt={formatAddress(listing)}
            sx={{ objectFit: "cover" }}
          />
        </CardActionArea>
        <IconButton
          aria-label={favorited ? "Remove favorite" : "Save favorite"}
          onClick={() => {
            const next = toggleFavoriteListing(listing.id);
            setFavorited(next);
          }}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "background.paper",
            "&:hover": { backgroundColor: "background.paper" },
          }}
        >
          {favorited ? (
            <FavoriteIcon color="primary" fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
        {listing.virtualTourUrl ? (
          <Chip
            label="Virtual Tour"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              backgroundColor: "rgba(255,255,255,0.92)",
            }}
          />
        ) : null}
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          {statusLabel ? (
            <Chip label={statusLabel} size="small" color="warning" variant="outlined" />
          ) : null}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatPrice(listing.listPrice)}
          </Typography>
          <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: "wrap" }}>
            {listing.beds ? (
              <Typography variant="body2" color="text.secondary">
                {listing.beds} Bed
              </Typography>
            ) : null}
            {listing.baths ? (
              <Typography variant="body2" color="text.secondary">
                {listing.baths} Bath
              </Typography>
            ) : null}
            {listing.sqft ? (
              <Typography variant="body2" color="text.secondary">
                {listing.sqft} Sq Ft
              </Typography>
            ) : null}
            {listing.lotSizeAcres ? (
              <Typography variant="body2" color="text.secondary">
                {listing.lotSizeAcres} Acres
              </Typography>
            ) : null}
          </Stack>
          <Typography variant="body2">{formatAddress(listing)}</Typography>
          {listing.listingOffice ? (
            <Typography variant="caption" color="text.secondary">
              Listing Office: {listing.listingOffice}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
