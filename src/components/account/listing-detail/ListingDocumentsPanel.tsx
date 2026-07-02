"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
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
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { upload } from "@vercel/blob/client";
import {
  createListingDocumentAction,
  type CreateListingDocumentState,
} from "@/lib/consumer/document-actions";
import { buildAccountDocumentHref } from "@/lib/storage/document-access";
import { partitionListingDocuments } from "@/lib/storage/document-classify";
import {
  ALLOWED_DOCUMENT_TYPES,
  buildDocumentPathname,
  MAX_DOCUMENT_BYTES,
} from "@/lib/storage/blob";
import type { ConsumerListingDocument } from "@/types/consumer-listing-detail";

const DOCUMENT_ACCEPT = ALLOWED_DOCUMENT_TYPES.join(",");
const MAX_DOCUMENT_MB = Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024));

type ListingDocumentsPanelProps = {
  listingId: string;
  documents: ConsumerListingDocument[];
  allowUpload?: boolean;
  description?: string;
};

function docNameFromFile(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.replace(/[-_]+/g, " ").trim() || "Document";
}

function formatUploadedAt(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ListingDocumentsPanel({
  listingId,
  documents,
  allowUpload = true,
  description = "Secure folder for listing paperwork. Upload documents for your agent to review and organize.",
}: ListingDocumentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<
    CreateListingDocumentState,
    FormData
  >(createListingDocumentAction, {});

  const otherDocuments = useMemo(
    () => partitionListingDocuments(documents).otherDocuments,
    [documents],
  );

  const handleFileSelect = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    setPendingUrl(null);

    try {
      if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
        setUploadError("Only PDF, JPEG, PNG, and WebP files are allowed.");
        return;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setUploadError(`Each file must be under ${MAX_DOCUMENT_MB} MB.`);
        return;
      }

      const pathname = buildDocumentPathname(listingId, file.name);
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: `/api/account/listings/${listingId}/documents/upload`,
      });

      setDocName(docNameFromFile(file.name));
      setPendingUrl(result.url);
    } catch (error) {
      console.error(error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Transaction documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>

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
                        href={buildAccountDocumentHref(listingId, doc.id, "view")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </Link>
                      <Link
                        href={buildAccountDocumentHref(listingId, doc.id, "download")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </Link>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {allowUpload ? (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Upload a document
            </Typography>
            <input
              ref={inputRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              hidden
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={18} /> : <UploadFileOutlinedIcon />}
              disabled={uploading || pending}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Uploading…" : "Choose file"}
            </Button>
            {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
            {pendingUrl ? (
              <Box component="form" action={formAction}>
                <input type="hidden" name="listingId" value={listingId} />
                <input type="hidden" name="url" value={pendingUrl} />
                <Stack spacing={2}>
                  <TextField
                    name="name"
                    label="Document name"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    required
                    fullWidth
                    size="small"
                  />
                  {state.error ? <Alert severity="error">{state.error}</Alert> : null}
                  {state.success ? (
                    <Alert severity="success">Document saved successfully.</Alert>
                  ) : null}
                  <Button type="submit" variant="contained" disabled={pending || !docName.trim()}>
                    {pending ? "Saving…" : "Save document"}
                  </Button>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
