"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { upload } from "@vercel/blob/client";
import {
  createCrmListingDocumentFromUpload,
  createCrmListingPhotoFromUpload,
  deleteCrmListingDocument,
} from "@/lib/crm/document-actions";
import { buildCrmDocumentHref } from "@/lib/storage/document-access";
import { partitionListingDocuments } from "@/lib/storage/document-classify";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_PHOTO_TYPES,
  buildDocumentPathname,
  buildPhotoPathname,
  MAX_DOCUMENT_BYTES,
  MAX_PHOTO_BYTES,
  MAX_PHOTO_COUNT,
} from "@/lib/storage/blob";

const PHOTO_ACCEPT = ALLOWED_PHOTO_TYPES.join(",");
const DOCUMENT_ACCEPT = ALLOWED_DOCUMENT_TYPES.join(",");
const MAX_PHOTO_MB = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));
const MAX_DOCUMENT_MB = Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024));

type ListingDocument = {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date | string;
};

type CrmListingMediaSectionProps = {
  listingId: string;
  documents: ListingDocument[];
};

type DeleteTarget = {
  id: string;
  name: string;
  kind: "photo" | "document";
};

function nameFromFile(filename: string, fallback: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || fallback;
}

function formatUploadedAt(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CrmListingMediaSection({
  listingId,
  documents,
}: CrmListingMediaSectionProps) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const { photos, otherDocuments } = partitionListingDocuments(documents);

  const [photoUploading, setPhotoUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [pendingDocUrl, setPendingDocUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const refreshAfterMutation = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  async function handlePhotoUpload(files: FileList | null) {
    const fileList = files ? Array.from(files) : [];
    if (fileList.length === 0) return;

    setPhotoError(null);
    setPhotoUploading(true);

    try {
      const remainingSlots = MAX_PHOTO_COUNT - photos.length;
      if (remainingSlots <= 0) {
        setPhotoError(`A listing can have at most ${MAX_PHOTO_COUNT} photos.`);
        return;
      }

      const filesToUpload = fileList.slice(0, remainingSlots);
      if (fileList.length > remainingSlots) {
        setPhotoError(`Only ${remainingSlots} more photo(s) can be added.`);
      }

      for (const file of filesToUpload) {
        if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
          setPhotoError("Use JPEG, PNG, or WebP images.");
          continue;
        }
        if (file.size > MAX_PHOTO_BYTES) {
          setPhotoError(`Each photo must be under ${MAX_PHOTO_MB} MB.`);
          continue;
        }

        const pathname = buildPhotoPathname(file.name);
        const result = await upload(pathname, file, {
          access: "public",
          handleUploadUrl: "/api/crm/uploads",
          clientPayload: JSON.stringify({ listingId }),
          multipart: file.size > 5 * 1024 * 1024,
        });

        const saveResult = await createCrmListingPhotoFromUpload(
          listingId,
          nameFromFile(file.name, "Photo"),
          result.url,
        );

        if (saveResult.error) {
          setPhotoError(saveResult.error);
          break;
        }
      }

      refreshAfterMutation();
    } catch (error) {
      console.error(error);
      setPhotoError("Photo upload failed. Please try again.");
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  async function handleDocumentFileSelect(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setDocError(null);
    setDocSuccess(null);
    setDocUploading(true);
    setPendingDocUrl(null);

    try {
      if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
        setDocError("Only PDF, JPEG, PNG, and WebP files are allowed.");
        return;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setDocError(`Each file must be under ${MAX_DOCUMENT_MB} MB.`);
        return;
      }

      const pathname = buildDocumentPathname(listingId, file.name);
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: `/api/crm/listings/${listingId}/documents/upload`,
      });

      setDocName(nameFromFile(file.name, "Document"));
      setPendingDocUrl(result.url);
    } catch (error) {
      console.error(error);
      setDocError("Upload failed. Please try again.");
    } finally {
      setDocUploading(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  }

  async function handleSaveDocument() {
    if (!pendingDocUrl || !docName.trim()) return;

    setDocError(null);
    setDocSuccess(null);

    const result = await createCrmListingDocumentFromUpload(
      listingId,
      docName.trim(),
      pendingDocUrl,
    );

    if (result.error) {
      setDocError(result.error);
      return;
    }

    setPendingDocUrl(null);
    setDocName("");
    setDocSuccess("Document saved successfully.");
    refreshAfterMutation();
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setActionError(null);
    const result = await deleteCrmListingDocument(listingId, deleteTarget.id);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setDeleteTarget(null);
    refreshAfterMutation();
  }

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Photos & documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage listing photos and transaction documents for this property.
          </Typography>
        </Box>

        {actionError ? <Alert severity="error">{actionError}</Alert> : null}

        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Photos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                JPEG, PNG, or WebP up to {MAX_PHOTO_MB} MB each ({photos.length}/{MAX_PHOTO_COUNT})
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={
                photoUploading ? <CircularProgress size={16} /> : <AddPhotoAlternateOutlinedIcon />
              }
              disabled={photoUploading || isPending || photos.length >= MAX_PHOTO_COUNT}
              onClick={() => photoInputRef.current?.click()}
            >
              {photoUploading ? "Uploading…" : "Add photos"}
            </Button>
            <input
              ref={photoInputRef}
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              hidden
              onChange={(e) => void handlePhotoUpload(e.target.files)}
            />
          </Stack>

          {photoError ? <Alert severity="error">{photoError}</Alert> : null}

          {photos.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
              <Typography color="text.secondary">No photos yet.</Typography>
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
                  <IconButton
                    size="small"
                    aria-label={`Delete ${photo.name}`}
                    onClick={() =>
                      setDeleteTarget({ id: photo.id, name: photo.name, kind: "photo" })
                    }
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      backgroundColor: "rgba(0,0,0,0.55)",
                      color: "common.white",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.75)" },
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
          )}
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Documents
          </Typography>

          {otherDocuments.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
              <Typography color="text.secondary">No documents yet.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell align="right">Actions</TableCell>
                    <TableCell align="right" width={56} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {otherDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>{formatUploadedAt(doc.uploadedAt)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                          <Link
                            href={buildCrmDocumentHref(listingId, doc.id, "view")}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Link>
                          <Link
                            href={buildCrmDocumentHref(listingId, doc.id, "download")}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </Link>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label={`Delete ${doc.name}`}
                          onClick={() =>
                            setDeleteTarget({ id: doc.id, name: doc.name, kind: "document" })
                          }
                        >
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Upload a document
              </Typography>
              <input
                ref={docInputRef}
                type="file"
                accept={DOCUMENT_ACCEPT}
                hidden
                onChange={(e) => void handleDocumentFileSelect(e.target.files)}
              />
              <Button
                variant="outlined"
                startIcon={docUploading ? <CircularProgress size={18} /> : <UploadFileOutlinedIcon />}
                disabled={docUploading || isPending}
                onClick={() => docInputRef.current?.click()}
              >
                {docUploading ? "Uploading…" : "Choose file"}
              </Button>
              {docError ? <Alert severity="error">{docError}</Alert> : null}
              {docSuccess ? <Alert severity="success">{docSuccess}</Alert> : null}
              {pendingDocUrl ? (
                <Stack spacing={2}>
                  <TextField
                    label="Document name"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    disabled={isPending || !docName.trim()}
                    onClick={() => void handleSaveDocument()}
                  >
                    Save document
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </Stack>

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

      <Dialog open={deleteTarget != null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>
          Delete {deleteTarget?.kind === "photo" ? "photo" : "document"}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            &ldquo;{deleteTarget?.name}&rdquo; will be removed from this listing. The file will
            remain in storage but will no longer appear here.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void handleConfirmDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
