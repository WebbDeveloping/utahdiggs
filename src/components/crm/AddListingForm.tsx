"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import NextLink from "next/link";
import { upload } from "@vercel/blob/client";
import {
  ALLOWED_PHOTO_TYPES,
  buildPhotoPathname,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from "@/lib/storage/blob";
import {
  LISTING_STATUSES,
  DEFAULT_LISTING_STATUS,
  formatListingStatusLabel,
} from "@/lib/crm/listing-status";
import { createListingAction } from "@/lib/crm/listing-actions";
import type {
  ClosingTeamOptions,
  CreateListingFieldErrors,
} from "@/types/crm-listing";

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

type AddListingFormProps = {
  closingTeam: ClosingTeamOptions;
};

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
  fieldErrors: CreateListingFieldErrors | undefined,
  key: string,
): string | undefined {
  return fieldErrors?.[key as keyof CreateListingFieldErrors];
}

export default function AddListingForm({ closingTeam }: AddListingFormProps) {
  const [state, formAction, pending] = useActionState(createListingAction, {});
  const [photos, setPhotos] = useState<PhotoRow[]>([createEmptyPhotoRow()]);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const errors = state.fieldErrors;
  const hasUploadInProgress = photos.some((photo) => photo.uploadStatus === "uploading");

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
        handleUploadUrl: "/api/crm/uploads",
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

      <Stack spacing={3}>
        {state.error ? <Alert severity="error">{state.error}</Alert> : null}

        <Section title="Address">
          <TextField
            name="address"
            label="Street address"
            required
            fullWidth
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
              sx={inputSx}
              error={Boolean(errors?.city)}
              helperText={errors?.city}
            />
            <TextField
              name="state"
              label="State"
              required
              slotProps={{
                htmlInput: { maxLength: 2, style: { textTransform: "uppercase" } },
              }}
              sx={{ ...inputSx, minWidth: { sm: 100 } }}
              error={Boolean(errors?.state)}
              helperText={errors?.state}
            />
            <TextField
              name="zip"
              label="Zip"
              required
              sx={{ ...inputSx, minWidth: { sm: 120 } }}
              error={Boolean(errors?.zip)}
              helperText={errors?.zip}
            />
          </Stack>
        </Section>

        <Section
          title="Property details"
          description="Optional fields used on the public listing page and search."
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="listPrice"
              label="List price"
              type="number"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.listPrice)}
              helperText={errors?.listPrice}
            />
            <TextField
              name="listDate"
              label="List date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              sx={inputSx}
              error={Boolean(errors?.listDate)}
              helperText={errors?.listDate}
            />
            <TextField
              name="mlsNumber"
              label="MLS number"
              fullWidth
              sx={inputSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField name="beds" label="Beds" fullWidth sx={inputSx} />
            <TextField name="baths" label="Baths" fullWidth sx={inputSx} />
            <TextField name="sqft" label="Sq ft" fullWidth sx={inputSx} />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="yearBuilt"
              label="Year built"
              type="number"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.yearBuilt)}
              helperText={errors?.yearBuilt}
            />
            <TextField
              name="lotSizeAcres"
              label="Lot size (acres)"
              type="number"
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.lotSizeAcres)}
              helperText={errors?.lotSizeAcres}
            />
            <TextField
              name="listingOffice"
              label="Listing office"
              fullWidth
              sx={inputSx}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="neighborhood"
              label="Neighborhood"
              fullWidth
              sx={inputSx}
            />
            <TextField
              name="subdivision"
              label="Subdivision"
              fullWidth
              sx={inputSx}
            />
          </Stack>
          <TextField
            name="virtualTourUrl"
            label="Virtual tour URL"
            fullWidth
            sx={inputSx}
            error={Boolean(errors?.virtualTourUrl)}
            helperText={errors?.virtualTourUrl}
          />
          <TextField
            name="description"
            label="Description"
            multiline
            minRows={4}
            fullWidth
            sx={inputSx}
          />
          <FormControlLabel
            control={<Switch name="hasPool" />}
            label="Has pool"
          />
        </Section>

        <Section
          title="Primary seller"
          description="The seller's phone number sets the portal PIN (last 4 digits)."
        >
          <TextField
            name="sellerName"
            label="Name"
            required
            fullWidth
            sx={inputSx}
            error={Boolean(errors?.sellerName)}
            helperText={errors?.sellerName}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="sellerEmail"
              label="Email"
              type="email"
              required
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.sellerEmail)}
              helperText={errors?.sellerEmail}
            />
            <TextField
              name="sellerPhone"
              label="Phone"
              type="tel"
              required
              fullWidth
              sx={inputSx}
              error={Boolean(errors?.sellerPhone)}
              helperText={errors?.sellerPhone}
            />
          </Stack>
        </Section>

        <Section
          title="Co-sellers"
          description="Up to three co-sellers can access the seller portal with their email."
        >
          {[0, 1, 2].map((i) => (
            <Stack key={i} direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name={`coSellerEmail${i}`}
                label={`Co-seller ${i + 1} email`}
                type="email"
                fullWidth
                sx={inputSx}
                error={Boolean(fieldError(errors, `coSellerEmail${i}`))}
                helperText={fieldError(errors, `coSellerEmail${i}`)}
              />
              <TextField
                name={`coSellerName${i}`}
                label="Name"
                fullWidth
                sx={inputSx}
              />
              <TextField
                name={`coSellerPhone${i}`}
                label="Phone"
                type="tel"
                fullWidth
                sx={inputSx}
              />
            </Stack>
          ))}
        </Section>

        <Section title="Closing team">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel id="escrow-officer-label">Escrow officer</InputLabel>
              <Select
                labelId="escrow-officer-label"
                name="escrowOfficerId"
                label="Escrow officer"
                defaultValue=""
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {closingTeam.escrowOfficers.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                    {member.company ? ` — ${member.company}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel id="tc-label">Transaction coordinator</InputLabel>
              <Select
                labelId="tc-label"
                name="transactionCoordinatorId"
                label="Transaction coordinator"
                defaultValue=""
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {closingTeam.transactionCoordinators.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                    {member.company ? ` — ${member.company}` : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Section>

        <Section
          title="Photos"
          description={`Upload listing photos (JPEG, PNG, or WebP, up to ${MAX_PHOTO_MB} MB each).`}
        >
          <Stack spacing={2}>
            {errors?.photos ? (
              <Alert severity="error">{errors.photos}</Alert>
            ) : null}
            {photos.map((photo, index) => (
              <Paper
                key={photo.id}
                variant="outlined"
                sx={{ p: 2, borderColor: "divider" }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ alignItems: { sm: "flex-start" } }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", sm: 120 },
                        height: 90,
                        flexShrink: 0,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "background.default",
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
                      {fieldError(errors, `photoUrl${index}`) ? (
                        <Typography variant="caption" color="error">
                          {fieldError(errors, `photoUrl${index}`)}
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
              {photos.length >= MAX_PHOTO_COUNT ? (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  Maximum {MAX_PHOTO_COUNT} photos per listing.
                </Typography>
              ) : null}
            </Box>
          </Stack>
        </Section>

        <Section title="Admin">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth sx={inputSx} required>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                label="Status"
                defaultValue={DEFAULT_LISTING_STATUS}
              >
                {LISTING_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {formatListingStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Active listings appear in public search.</FormHelperText>
            </FormControl>
            <TextField
              name="portfolioGroup"
              label="Portfolio group"
              fullWidth
              sx={inputSx}
              helperText="Optional — groups multiple listings for portfolio routing."
            />
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
            <Button component={NextLink} href="/crm/listings" color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={pending || hasUploadInProgress}
            >
              {pending ? "Creating…" : hasUploadInProgress ? "Uploading photos…" : "Create listing"}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
