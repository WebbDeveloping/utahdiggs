"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { partitionListingDocuments } from "@/lib/storage/document-classify";
import type { ConsumerListingDocument } from "@/types/consumer-listing-detail";

type ListingImagesTabProps = {
  documents: ConsumerListingDocument[];
};

export default function ListingImagesTab({ documents }: ListingImagesTabProps) {
  const photos = useMemo(
    () => partitionListingDocuments(documents).photos,
    [documents],
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setActivePhotoIndex((current) => (current === 0 ? photos.length - 1 : current - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setActivePhotoIndex((current) => (current === photos.length - 1 ? 0 : current + 1));
  }, [photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") goToPrevious();
      if (event.key === "ArrowRight") goToNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Listing images
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Photos uploaded during onboarding and listing setup.
        </Typography>
      </Box>

      {photos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
          <Typography color="text.secondary">No images yet.</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 1.5,
          }}
        >
          {photos.map((photo, index) => (
            <Box
              key={photo.id}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                aspectRatio: "4 / 3",
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={() => openLightbox(index)}
                aria-label={`View ${photo.name}`}
                sx={{
                  border: 0,
                  p: 0,
                  m: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  display: "block",
                  background: "none",
                }}
              >
                <Box
                  component="img"
                  src={photo.url}
                  alt={photo.name}
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  px: 1,
                  py: 0.5,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  color: "common.white",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {photo.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={lightboxOpen} onClose={closeLightbox} fullScreen>
        <Stack sx={{ height: "100%", position: "relative", backgroundColor: "rgba(0,0,0,0.95)" }}>
          <IconButton
            onClick={closeLightbox}
            aria-label="Close gallery"
            sx={{ position: "absolute", top: 16, right: 16, zIndex: 2, color: "common.white" }}
          >
            <CloseIcon />
          </IconButton>

          {photos.length > 1 ? (
            <>
              <IconButton
                onClick={goToPrevious}
                aria-label="Previous photo"
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  color: "common.white",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.55)" },
                }}
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
              <IconButton
                onClick={goToNext}
                aria-label="Next photo"
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                  color: "common.white",
                  backgroundColor: "rgba(0,0,0,0.35)",
                  "&:hover": { backgroundColor: "rgba(0,0,0,0.55)" },
                }}
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </>
          ) : null}

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, md: 6 },
            }}
          >
            <Box
              component="img"
              src={photos[activePhotoIndex]?.url}
              alt={photos[activePhotoIndex]?.name ?? "Listing photo"}
              sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              color: "common.white",
            }}
          >
            {activePhotoIndex + 1} / {photos.length}
          </Typography>
        </Stack>
      </Dialog>
    </Stack>
  );
}
