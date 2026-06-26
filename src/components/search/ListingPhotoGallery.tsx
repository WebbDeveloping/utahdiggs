"use client";

import { useCallback, useEffect, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

type Photo = {
  id: string;
  name: string;
  url: string;
};

type ListingPhotoGalleryProps = {
  photos: Photo[];
  virtualTourUrl?: string | null;
  address: string;
};

export default function ListingPhotoGallery({
  photos,
  virtualTourUrl,
  address,
}: ListingPhotoGalleryProps) {
  const galleryPhotos =
    photos.length > 0 ? photos : [{ id: "placeholder", name: "Home", url: PLACEHOLDER_IMAGE }];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? galleryPhotos.length - 1 : current - 1));
  }, [galleryPhotos.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current === galleryPhotos.length - 1 ? 0 : current + 1));
  }, [galleryPhotos.length]);

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

  const remainingCount = galleryPhotos.length > 3 ? galleryPhotos.length - 3 : 0;

  return (
    <>
      <Stack spacing={1.5}>
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
            component="button"
            type="button"
            onClick={() => openLightbox(0)}
            aria-label={`View photo 1 of ${galleryPhotos.length}`}
            sx={{
              border: 0,
              p: 0,
              cursor: "pointer",
              display: "block",
              width: "100%",
              background: "none",
            }}
          >
            <Box
              component="img"
              src={galleryPhotos[0].url}
              alt={galleryPhotos[0].name || `Photo 1 of ${address}`}
              sx={{ width: "100%", height: { xs: 280, md: 420 }, objectFit: "cover", display: "block" }}
            />
          </Box>
          <Stack spacing={1}>
            {galleryPhotos.slice(1, 3).map((photo, index) => {
              const photoIndex = index + 1;
              const isLastThumbnail = photoIndex === 2 && remainingCount > 0;

              return (
                <Box
                  key={photo.id}
                  component="button"
                  type="button"
                  onClick={() => openLightbox(photoIndex)}
                  aria-label={`View photo ${photoIndex + 1} of ${galleryPhotos.length}`}
                  sx={{
                    position: "relative",
                    border: 0,
                    p: 0,
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    background: "none",
                  }}
                >
                  <Box
                    component="img"
                    src={photo.url}
                    alt={photo.name || `Photo ${photoIndex + 1} of ${address}`}
                    sx={{
                      width: "100%",
                      height: { xs: 136, md: 206 },
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {isLastThumbnail ? (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "common.white", fontWeight: 700 }}>
                        {remainingCount} More
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        </Box>

        {virtualTourUrl ? (
          <Button
            component="a"
            href={virtualTourUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<OpenInNewIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Virtual Tour
          </Button>
        ) : null}
      </Stack>

      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        fullScreen
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.95)",
            },
          },
        }}
      >
        <Stack sx={{ height: "100%", position: "relative" }}>
          <IconButton
            onClick={closeLightbox}
            aria-label="Close gallery"
            sx={{ position: "absolute", top: 16, right: 16, zIndex: 2, color: "common.white" }}
          >
            <CloseIcon />
          </IconButton>

          {galleryPhotos.length > 1 ? (
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
              src={galleryPhotos[activeIndex]?.url}
              alt={galleryPhotos[activeIndex]?.name || `Photo ${activeIndex + 1} of ${address}`}
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
            {activeIndex + 1} / {galleryPhotos.length}
          </Typography>
        </Stack>
      </Dialog>
    </>
  );
}
