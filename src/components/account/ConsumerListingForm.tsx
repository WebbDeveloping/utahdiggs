"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PhoneTextField from "@/components/ui/PhoneTextField";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import NextLink from "next/link";
import { upload } from "@vercel/blob/client";
import { createConsumerListingAction } from "@/lib/consumer/listing-actions";
import {
  ALLOWED_PHOTO_TYPES,
  buildPhotoPathname,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from "@/lib/storage/blob";
import type { ConsumerCreateListingFieldErrors } from "@/types/consumer-listing";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "background.default",
  },
};

type PhotoUploadStatus = "empty" | "uploading" | "uploaded" | "error";

type PhotoRow = {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  uploadStatus: PhotoUploadStatus;
  uploadError?: string;
};

const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(",");
const MAX_PHOTO_MB = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));

function createEmptyPhotoRow(): PhotoRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    uploadStatus: "empty",
  };
}

function photoNameFromFile(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || "Photo";
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2.5, sm: 3 }, border: "1px solid", borderColor: "divider" }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}

function fieldError(
  fieldErrors: ConsumerCreateListingFieldErrors | undefined,
  key: string,
): string | undefined {
  return fieldErrors?.[key as keyof ConsumerCreateListingFieldErrors];
}

type ConsumerListingFormProps = {
  user: {
    name?: string | null;
    email: string;
    phone?: string | null;
  };
  initialValues?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    sellerName?: string;
    sellerPhone?: string;
    inquiryId?: string;
  };
};

export default function ConsumerListingForm({ user, initialValues }: ConsumerListingFormProps) {
  const [state, formAction, pending] = useActionState(createConsumerListingAction, {});
  const [photos, setPhotos] = useState<PhotoRow[]>([createEmptyPhotoRow()]);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const errors = state.fieldErrors;
  const hasUploadInProgress = photos.some((photo) => photo.uploadStatus === "uploading");
  const sellerName = initialValues?.sellerName?.trim() || user.name?.trim() || "";
  const sellerPhone = initialValues?.sellerPhone?.trim() || user.phone?.trim() || "";
  const addressDefault = initialValues?.address?.trim() || "";
  const cityDefault = initialValues?.city?.trim() || "";
  const stateDefault = initialValues?.state?.trim() || "UT";
  const zipDefault = initialValues?.zip?.trim() || "";

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
      previewUrls.clear();
    };
  }, []);

  function trackPreviewUrl(url: string) {
    previewUrlsRef.current.add(url);
    return url;
  }

  function revokePreviewUrl(url?: string) {
    if (!url) return;
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  }

  function addPhotoRow() {
    setPhotos((rows) => [...rows, createEmptyPhotoRow()]);
  }

  function removePhotoRow(index: number) {
    setPhotos((rows) => {
      const row = rows[index];
      revokePreviewUrl(row.previewUrl);
      const next = rows.filter((_, i) => i !== index);
      return next.length > 0 ? next : [createEmptyPhotoRow()];
    });
  }

  function updatePhotoName(index: number, name: string) {
    setPhotos((rows) =>
      rows.map((row, i) => (i === index ? { ...row, name } : row)),
    );
  }

  async function handlePhotoFileSelect(index: number, file: File | undefined) {
    if (!file) return;

    if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      setPhotos((rows) =>
        rows.map((row, i) =>
          i === index
            ? {
                ...row,
                uploadStatus: "error",
                uploadError: "Use a JPEG, PNG, or WebP image.",
              }
            : row,
        ),
      );
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotos((rows) =>
        rows.map((row, i) =>
          i === index
            ? {
                ...row,
                uploadStatus: "error",
                uploadError: `Image must be ${MAX_PHOTO_MB} MB or smaller.`,
              }
            : row,
        ),
      );
      return;
    }

    const previewUrl = trackPreviewUrl(URL.createObjectURL(file));
    const defaultName = photoNameFromFile(file.name);

    setPhotos((rows) =>
      rows.map((row, i) =>
        i === index
          ? {
              ...row,
              name: defaultName,
              url: "",
              previewUrl,
              uploadStatus: "uploading",
              uploadError: undefined,
            }
          : row,
      ),
    );

    try {
      const pathname = buildPhotoPathname(file.name);
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/account/uploads",
        multipart: file.size > 5 * 1024 * 1024,
      });

      setPhotos((rows) =>
        rows.map((row, i) =>
          i === index
            ? {
                ...row,
                name: row.name || defaultName,
                url: blob.url,
                uploadStatus: "uploaded",
                uploadError: undefined,
              }
            : row,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload failed. Please try again.";
      setPhotos((rows) =>
        rows.map((row, i) =>
          i === index
            ? {
                ...row,
                url: "",
                uploadStatus: "error",
                uploadError: message,
              }
            : row,
        ),
      );
    }
  }

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="photoCount" value={photos.length} />
      {initialValues?.inquiryId ? (
        <input type="hidden" name="inquiryId" value={initialValues.inquiryId} />
      ) : null}

      <Stack spacing={3}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Alert severity="info">
          Your listing will be reviewed by our team before it appears in search
          results.{" "}
          <NextLink href="/account/listings/new/mls-input">
            Complete the full MLS listing form
          </NextLink>{" "}
          instead (20–25 min, save &amp; resume).
        </Alert>

        <Section title="Property details">
          <TextField
            name="address"
            label="Street address"
            required
            fullWidth
            defaultValue={addressDefault}
            sx={inputSx}
            error={Boolean(errors?.address)}
            helperText={errors?.address}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="city"
              label="City"
              required
              fullWidth
              defaultValue={cityDefault}
              sx={inputSx}
              error={Boolean(errors?.city)}
              helperText={errors?.city}
            />
            <TextField
              name="state"
              label="State"
              required
              fullWidth
              defaultValue={stateDefault}
              slotProps={{ htmlInput: { maxLength: 2 } }}
              sx={{ ...inputSx, maxWidth: { sm: 120 } }}
              error={Boolean(errors?.state)}
              helperText={errors?.state}
            />
            <TextField
              name="zip"
              label="Zip"
              required
              fullWidth
              defaultValue={zipDefault}
              sx={{ ...inputSx, maxWidth: { sm: 140 } }}
              error={Boolean(errors?.zip)}
              helperText={errors?.zip}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="listPrice"
              label="List price"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.listPrice)}
              helperText={errors?.listPrice}
            />
            <TextField
              name="beds"
              label="Beds"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.beds)}
              helperText={errors?.beds}
            />
            <TextField
              name="baths"
              label="Baths"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.baths)}
              helperText={errors?.baths}
            />
            <TextField
              name="sqft"
              label="Sq ft"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.sqft)}
              helperText={errors?.sqft}
            />
          </Stack>
          <TextField
            name="description"
            label="Description"
            fullWidth
            multiline
            minRows={4}
            sx={inputSx}
            error={Boolean(errors?.description)}
            helperText={errors?.description}
          />
        </Section>

        <Section
          title="Seller information"
          description="Used for seller portal access. Your phone's last 4 digits become your portal PIN."
        >
          <TextField
            name="sellerName"
            label="Name"
            required
            fullWidth
            defaultValue={sellerName}
            sx={inputSx}
            error={Boolean(errors?.sellerName)}
            helperText={errors?.sellerName}
          />
          <TextField
            name="sellerEmail"
            label="Email"
            required
            fullWidth
            defaultValue={user.email}
            slotProps={{ input: { readOnly: true } }}
            sx={inputSx}
            error={Boolean(errors?.sellerEmail)}
            helperText={errors?.sellerEmail ?? "From your account"}
          />
          <PhoneTextField
            name="sellerPhone"
            label="Phone"
            required
            fullWidth
            defaultValue={sellerPhone}
            sx={inputSx}
            error={Boolean(errors?.sellerPhone)}
            helperText={errors?.sellerPhone}
          />
        </Section>

        <Section
          title="Photos"
          description={`Add at least one photo. Up to ${MAX_PHOTO_COUNT} photos, ${MAX_PHOTO_MB} MB each.`}
        >
          {errors?.photos ? (
            <Alert severity="error">{errors.photos}</Alert>
          ) : null}
          <Stack spacing={2}>
            {photos.map((photo, index) => (
              <Paper
                key={photo.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 160 },
                      height: 120,
                      flexShrink: 0,
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
                        alt={photo.name || "Listing photo preview"}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <ImageOutlinedIcon color="disabled" />
                    )}
                  </Box>

                  <Stack spacing={2} sx={{ flex: 1, width: "100%" }}>
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
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          void handlePhotoFileSelect(index, file);
                          event.target.value = "";
                        }}
                      />
                    </Button>

                    <TextField
                      name={`photoName${index}`}
                      label="Photo name"
                      value={photo.name}
                      onChange={(e) => updatePhotoName(index, e.target.value)}
                      fullWidth
                      sx={inputSx}
                      disabled={photo.uploadStatus === "uploading"}
                      error={Boolean(fieldError(errors, `photoName${index}`))}
                      helperText={fieldError(errors, `photoName${index}`)}
                    />

                    <input type="hidden" name={`photoUrl${index}`} value={photo.url} />

                    {photo.uploadStatus === "uploaded" ? (
                      <Typography variant="caption" color="success.main">
                        Uploaded
                      </Typography>
                    ) : null}
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
                      onClick={() => removePhotoRow(index)}
                      disabled={photo.uploadStatus === "uploading"}
                      sx={{ flexShrink: 0 }}
                      startIcon={<DeleteOutlinedIcon />}
                    >
                      Remove
                    </Button>
                  ) : null}
                </Stack>
              </Paper>
            ))}
            <Box>
              <Button
                type="button"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addPhotoRow}
                disabled={photos.length >= MAX_PHOTO_COUNT}
              >
                Add photo
              </Button>
            </Box>
          </Stack>
        </Section>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            position: "sticky",
            bottom: 16,
            zIndex: 1,
            backgroundColor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button component={NextLink} href="/account/listings" color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={pending || hasUploadInProgress}
            >
              {pending
                ? "Submitting…"
                : hasUploadInProgress
                  ? "Uploading photos…"
                  : "Submit listing"}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
