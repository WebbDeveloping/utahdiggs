"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import { upload } from "@vercel/blob/client";
import {
  skipOnboardingPhotosAction,
  submitOnboardingPhotosAction,
} from "@/lib/consumer/onboarding-actions";
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
const UPLOAD_CONCURRENCY = 3;

type PhotoUploadStatus = "uploading" | "uploaded" | "error";

type PhotoTile = {
  id: string;
  name: string;
  url: string;
  previewUrl: string;
  file: File | null;
  uploadStatus: PhotoUploadStatus;
  uploadError?: string;
};

function photoNameFromFile(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || "Photo";
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;

  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await worker(items[index]!);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runNext(),
  );
  await Promise.all(runners);
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
  const [photos, setPhotos] = useState<PhotoTile[]>([]);
  const [proPhotoTourRequested, setProPhotoTourRequested] = useState(initialTourRequested);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const [state, formAction, pending] = useActionState<OnboardingActionState, FormData>(
    submitOnboardingPhotosAction,
    {},
  );
  const [skipState, skipFormAction, skipPending] = useActionState<
    OnboardingActionState,
    FormData
  >(skipOnboardingPhotosAction, {});
  const actionPending = pending || skipPending;

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const hasUploadInProgress = photos.some((p) => p.uploadStatus === "uploading");
  const isFullService = servicePlan === "FULL_SERVICE";
  const remainingSlots = MAX_PHOTO_COUNT - photos.length;
  const canAddMore = remainingSlots > 0 && !actionPending;

  function revokePreview(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);
    previewUrlsRef.current.delete(previewUrl);
  }

  function updatePhoto(id: string, patch: Partial<PhotoTile>) {
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)));
  }

  async function uploadPhotoTile(tile: PhotoTile) {
    if (!tile.file) {
      updatePhoto(tile.id, {
        uploadStatus: "error",
        uploadError: "Upload failed. Please try again.",
      });
      return;
    }

    updatePhoto(tile.id, { uploadStatus: "uploading", uploadError: undefined });

    try {
      const pathname = buildPhotoPathname(tile.file.name);
      const result = await upload(pathname, tile.file, {
        access: "public",
        handleUploadUrl: "/api/account/uploads",
        multipart: tile.file.size > 5 * 1024 * 1024,
      });

      updatePhoto(tile.id, {
        url: result.url,
        uploadStatus: "uploaded",
        uploadError: undefined,
        file: null,
      });
    } catch {
      updatePhoto(tile.id, {
        uploadStatus: "error",
        uploadError: "Upload failed. Please try again.",
      });
    }
  }

  async function enqueueFiles(fileList: FileList | File[] | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (files.length === 0) return;

    setBatchMessage(null);

    const accepted: PhotoTile[] = [];
    const messages: string[] = [];
    let slotsLeft = MAX_PHOTO_COUNT - photos.length;

    if (slotsLeft <= 0) {
      setBatchMessage(`A listing can have at most ${MAX_PHOTO_COUNT} photos.`);
      return;
    }

    for (const file of files) {
      if (slotsLeft <= 0) {
        messages.push(`Only ${MAX_PHOTO_COUNT} photos can be added.`);
        break;
      }

      if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
        messages.push("Only JPEG, PNG, and WebP images are allowed.");
        continue;
      }

      if (file.size > MAX_PHOTO_BYTES) {
        messages.push(`Each photo must be under ${MAX_PHOTO_MB} MB.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);

      accepted.push({
        id: crypto.randomUUID(),
        name: photoNameFromFile(file.name),
        url: "",
        previewUrl,
        file,
        uploadStatus: "uploading",
      });
      slotsLeft -= 1;
    }

    if (messages.length > 0) {
      setBatchMessage([...new Set(messages)].join(" "));
    }

    if (accepted.length === 0) return;

    setPhotos((prev) => [...prev, ...accepted]);
    await runWithConcurrency(accepted, UPLOAD_CONCURRENCY, uploadPhotoTile);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target?.previewUrl) revokePreview(target.previewUrl);
      return prev.filter((photo) => photo.id !== id);
    });
  }

  async function retryPhoto(id: string) {
    const target = photos.find((photo) => photo.id === id);
    if (!target?.file) {
      updatePhoto(id, {
        uploadStatus: "error",
        uploadError: "Please remove this photo and select it again.",
      });
      return;
    }
    await uploadPhotoTile(target);
  }

  function openFilePicker() {
    if (!canAddMore) return;
    inputRef.current?.click();
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!canAddMore) return;
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (!canAddMore) return;
    void enqueueFiles(event.dataTransfer.files);
  }

  function handleDropzoneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
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

  const dropzoneSx = {
    border: "1px dashed",
    borderColor: dragActive ? "primary.main" : "divider",
    backgroundColor: dragActive ? "action.hover" : "transparent",
    borderRadius: 2,
    p: 3,
    textAlign: "center" as const,
    cursor: canAddMore ? "pointer" : "default",
    opacity: canAddMore ? 1 : 0.6,
    transition: "border-color 120ms ease, background-color 120ms ease",
  };

  return (
    <Box component="form" action={formAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <input
        type="hidden"
        name="proPhotoTourRequested"
        value={proPhotoTourRequested ? "true" : "false"}
      />
      {photos
        .filter((photo) => photo.uploadStatus === "uploaded" && photo.url)
        .map((photo, index) => (
          <Box key={`hidden-${photo.id}`}>
            <input type="hidden" name={`photoName${index}`} value={photo.name} />
            <input type="hidden" name={`photoUrl${index}`} value={photo.url} />
          </Box>
        ))}

      <Stack spacing={3}>
        {state.error || skipState.error ? (
          <Alert severity="error">{state.error ?? skipState.error}</Alert>
        ) : null}
        {state.fieldErrors?.photos ? (
          <Alert severity="error">{state.fieldErrors.photos}</Alert>
        ) : null}
        {batchMessage ? <Alert severity="warning">{batchMessage}</Alert> : null}

        <Typography variant="body2" color="text.secondary">
          {isFullService
            ? `Select multiple photos at once, drag and drop them here, check the box below to schedule a professional photo tour, or skip and add photos later. Up to ${MAX_PHOTO_COUNT} photos, ${MAX_PHOTO_MB} MB each. We need at least 2 exterior and 3 interior photos before MLS go-live.`
            : `Select multiple photos at once, or drag and drop them here. You can also skip and upload later before go-live. Up to ${MAX_PHOTO_COUNT} photos, ${MAX_PHOTO_MB} MB each.`}
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

        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            {photos.length} / {MAX_PHOTO_COUNT} · JPEG, PNG, WebP · {MAX_PHOTO_MB} MB each
          </Typography>

          <input
            ref={inputRef}
            type="file"
            hidden
            accept={PHOTO_ACCEPT}
            multiple
            onChange={(e) => {
              void enqueueFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {photos.length === 0 ? (
            <Box
              role="button"
              tabIndex={0}
              aria-label="Upload photos"
              onClick={openFilePicker}
              onKeyDown={handleDropzoneKeyDown}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={dropzoneSx}
            >
              <Stack spacing={1} sx={{ alignItems: "center" }}>
                <AddPhotoAlternateOutlinedIcon color="action" sx={{ fontSize: 36 }} />
                <Typography variant="subtitle1">Drag photos here or click to browse</Typography>
                <Typography variant="body2" color="text.secondary">
                  Select multiple photos at once
                </Typography>
              </Stack>
            </Box>
          ) : (
            <>
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
                {photos.map((photo) => (
                  <Box
                    key={photo.id}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: photo.uploadStatus === "error" ? "error.main" : "divider",
                      aspectRatio: "4 / 3",
                      backgroundColor: "action.hover",
                    }}
                  >
                    <Box
                      component="img"
                      src={photo.previewUrl}
                      alt={photo.name || "Photo preview"}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    {photo.uploadStatus === "uploading" ? (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.45)",
                        }}
                      >
                        <CircularProgress size={28} sx={{ color: "common.white" }} />
                      </Box>
                    ) : null}

                    {photo.uploadStatus === "error" ? (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          px: 1,
                          backgroundColor: "rgba(0,0,0,0.55)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "common.white", textAlign: "center" }}
                        >
                          {photo.uploadError ?? "Upload failed"}
                        </Typography>
                        <Button
                          type="button"
                          size="small"
                          variant="contained"
                          color="inherit"
                          startIcon={<ReplayOutlinedIcon />}
                          onClick={() => void retryPhoto(photo.id)}
                          disabled={!photo.file || actionPending}
                        >
                          Retry
                        </Button>
                      </Box>
                    ) : null}

                    <IconButton
                      size="small"
                      aria-label={`Remove ${photo.name || "photo"}`}
                      onClick={() => removePhoto(photo.id)}
                      disabled={photo.uploadStatus === "uploading" || actionPending}
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        color: "common.white",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.75)" },
                        "&.Mui-disabled": {
                          backgroundColor: "rgba(0,0,0,0.35)",
                          color: "rgba(255,255,255,0.5)",
                        },
                      }}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>

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

              {canAddMore ? (
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label="Add more photos"
                  onClick={openFilePicker}
                  onKeyDown={handleDropzoneKeyDown}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  sx={{ ...dropzoneSx, p: 2 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", justifyContent: "center" }}
                  >
                    <AddPhotoAlternateOutlinedIcon color="action" />
                    <Typography variant="body2">
                      Add more photos ({remainingSlots} remaining)
                    </Typography>
                  </Stack>
                </Box>
              ) : null}
            </>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button
            type="submit"
            formAction={skipFormAction}
            variant="outlined"
            color="inherit"
            disabled={actionPending || hasUploadInProgress}
          >
            {skipPending ? "Skipping…" : "Skip for now"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={actionPending || hasUploadInProgress}
          >
            {pending ? "Saving…" : hasUploadInProgress ? "Uploading…" : "Continue"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
