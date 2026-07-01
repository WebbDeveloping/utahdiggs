"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { upload } from "@vercel/blob/client";
import { submitOnboardingPhotosAction } from "@/lib/consumer/onboarding-actions";
import {
  ALLOWED_PHOTO_TYPES,
  buildPhotoPathname,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from "@/lib/storage/blob";
import type { OnboardingActionState } from "@/types/onboarding";
import type { ServicePlan } from "@/generated/prisma/client";

const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(",");
const MAX_PHOTO_MB = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));

type PhotoUploadStatus = "empty" | "uploading" | "uploaded" | "error";

type PhotoRow = {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  uploadStatus: PhotoUploadStatus;
  uploadError?: string;
};

function createEmptyPhotoRow(): PhotoRow {
  return { id: crypto.randomUUID(), name: "", url: "", uploadStatus: "empty" };
}

function photoNameFromFile(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || "Photo";
}

type OnboardingPhotoFormProps = {
  listingId: string;
  servicePlan: ServicePlan | null;
  proPhotoTourRequested: boolean;
  photosComplete: boolean;
};

export default function OnboardingPhotoForm({
  listingId,
  servicePlan,
  proPhotoTourRequested: initialTourRequested,
  photosComplete,
}: OnboardingPhotoFormProps) {
  const [photos, setPhotos] = useState<PhotoRow[]>([createEmptyPhotoRow()]);
  const [proPhotoTourRequested, setProPhotoTourRequested] = useState(initialTourRequested);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    submitOnboardingPhotosAction,
    {},
  );

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const hasUploadInProgress = photos.some((p) => p.uploadStatus === "uploading");
  const isFullService = servicePlan === "FULL_SERVICE";

  async function handlePhotoFileSelect(index: number, file: File | undefined) {
    if (!file) return;

    setPhotos((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, uploadStatus: "uploading", uploadError: undefined } : row,
      ),
    );

    try {
      const pathname = buildPhotoPathname(file.name);
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/account/uploads",
      });
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      setPhotos((prev) =>
        prev.map((row, i) =>
          i === index
            ? {
                ...row,
                name: photoNameFromFile(file.name),
                url: result.url,
                previewUrl,
                uploadStatus: "uploaded",
              }
            : row,
        ),
      );
    } catch {
      setPhotos((prev) =>
        prev.map((row, i) =>
          i === index
            ? { ...row, uploadStatus: "error", uploadError: "Upload failed. Please try again." }
            : row,
        ),
      );
    }
  }

  if (photosComplete) {
    return (
      <Alert severity="success">
        Photos step complete.
        {initialTourRequested ? " Professional photo tour requested." : ""}
      </Alert>
    );
  }

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="proPhotoTourRequested"
        value={proPhotoTourRequested ? "true" : "false"}
      />
      <Stack spacing={3}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}
        {state.fieldErrors?.photos ? (
          <Alert severity="error">{state.fieldErrors.photos}</Alert>
        ) : null}

        <Typography variant="body2" color="text.secondary">
          {isFullService
            ? "Upload your own photos now, or check the box below to schedule a professional photo tour. We need at least 2 exterior and 3 interior photos before MLS go-live."
            : `Add at least one photo now. Up to ${MAX_PHOTO_COUNT} photos, ${MAX_PHOTO_MB} MB each.`}
        </Typography>

        {isFullService ? (
          <FormControlLabel
            control={
              <Checkbox
                checked={proPhotoTourRequested}
                onChange={(e) => setProPhotoTourRequested(e.target.checked)}
              />
            }
            label="Schedule a professional photo tour (included with Full Service)"
          />
        ) : null}

        <Stack spacing={2}>
          {photos.map((photo, index) => (
            <Paper key={photo.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box
                  sx={{
                    width: { xs: "100%", sm: 160 },
                    height: 120,
                    borderRadius: 1,
                    overflow: "hidden",
                    backgroundColor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {photo.uploadStatus === "uploading" ? (
                    <CircularProgress size={28} />
                  ) : photo.previewUrl || photo.url ? (
                    <Box
                      component="img"
                      src={photo.previewUrl ?? photo.url}
                      alt={photo.name || "Photo preview"}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageOutlinedIcon color="disabled" />
                  )}
                </Box>

                <Stack spacing={2} sx={{ flex: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={photo.uploadStatus === "uploading"}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {photo.uploadStatus === "uploaded" ? "Replace photo" : "Choose photo"}
                    <input
                      type="file"
                      hidden
                      accept={PHOTO_ACCEPT}
                      onChange={(e) => {
                        void handlePhotoFileSelect(index, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </Button>
                  <TextField
                    name={`photoName${index}`}
                    label="Photo name"
                    value={photo.name}
                    onChange={(e) =>
                      setPhotos((prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, name: e.target.value } : row,
                        ),
                      )
                    }
                    fullWidth
                    disabled={photo.uploadStatus === "uploading"}
                  />
                  <input type="hidden" name={`photoUrl${index}`} value={photo.url} />
                  {photo.uploadError ? (
                    <Typography variant="caption" color="error">
                      {photo.uploadError}
                    </Typography>
                  ) : null}
                </Stack>

                {photos.length > 1 ? (
                  <Button
                    type="button"
                    color="inherit"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    disabled={photo.uploadStatus === "uploading"}
                  >
                    Remove
                  </Button>
                ) : null}
              </Stack>
            </Paper>
          ))}

          <Button
            type="button"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setPhotos((prev) => [...prev, createEmptyPhotoRow()])}
            disabled={photos.length >= MAX_PHOTO_COUNT}
          >
            Add photo
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={pending || hasUploadInProgress}
          >
            {pending ? "Saving…" : hasUploadInProgress ? "Uploading…" : "Continue"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
