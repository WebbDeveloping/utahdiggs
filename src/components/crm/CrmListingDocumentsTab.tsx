"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
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
  deleteCrmListingDocument,
} from "@/lib/crm/document-actions";
import {
  findDataFormResidentialDocument,
  findSignedListingAgreementDocument,
  isDataFormResidentialDocument,
  isListingAgreementDocument,
} from "@/lib/documents/listing-document-kinds";
import { buildCrmDocumentHref } from "@/lib/storage/document-access";
import { partitionListingDocuments } from "@/lib/storage/document-classify";
import {
  ALLOWED_DOCUMENT_TYPES,
  buildDocumentPathname,
  MAX_DOCUMENT_BYTES,
} from "@/lib/storage/blob";

const DOCUMENT_ACCEPT = ALLOWED_DOCUMENT_TYPES.join(",");
const MAX_DOCUMENT_MB = Math.round(MAX_DOCUMENT_BYTES / (1024 * 1024));

type ListingDocument = {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date | string;
};

type CrmListingDocumentsTabProps = {
  listingId: string;
  documents: ListingDocument[];
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

function FeaturedDocumentCard({
  listingId,
  document,
  title,
  description,
  primary,
}: {
  listingId: string;
  document: ListingDocument;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        borderColor: primary ? "primary.main" : "divider",
        bgcolor: primary ? "action.hover" : "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", minWidth: 0 }}>
          <DescriptionOutlinedIcon color={primary ? "primary" : "action"} sx={{ mt: 0.25 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Uploaded {formatUploadedAt(document.uploadedAt)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            component="a"
            href={buildCrmDocumentHref(listingId, document.id, "view")}
            target="_blank"
            rel="noopener noreferrer"
            variant={primary ? "contained" : "outlined"}
            endIcon={<OpenInNewIcon />}
          >
            Open
          </Button>
          <Button
            component="a"
            href={buildCrmDocumentHref(listingId, document.id, "download")}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
          >
            Download
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function CrmListingDocumentsTab({
  listingId,
  documents,
}: CrmListingDocumentsTabProps) {
  const router = useRouter();
  const docInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { otherDocuments } = partitionListingDocuments(documents);

  const signedAgreement = findSignedListingAgreementDocument(otherDocuments);
  const dataForm = findDataFormResidentialDocument(otherDocuments);

  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);
  const [docName, setDocName] = useState("");
  const [pendingDocUrl, setPendingDocUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListingDocument | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function refreshAfterMutation() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDocumentFileSelect(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setDocError(null);
    setDocSuccess(null);
    setDocUploading(true);

    try {
      if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
        setDocError("Only PDF, JPEG, PNG, and WebP documents are allowed.");
        return;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        setDocError(`Each document must be under ${MAX_DOCUMENT_MB} MB.`);
        return;
      }

      const pathname = buildDocumentPathname(listingId, file.name);
      const result = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: `/api/crm/listings/${listingId}/documents/upload`,
      });

      setPendingDocUrl(result.url);
      setDocName(nameFromFile(file.name, "Document"));
    } catch (err) {
      console.error(err);
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
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Signed agreements and transaction paperwork for this listing.
        </Typography>
      </Box>

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      <Stack spacing={2}>
        {signedAgreement ? (
          <FeaturedDocumentCard
            listingId={listingId}
            document={signedAgreement}
            title="Exclusive Right to Sell (Signed)"
            description="One-click open the signed listing agreement PDF."
            primary
          />
        ) : (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Signed listing agreement
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              No signed exclusive right-to-sell agreement is on file yet.
            </Typography>
          </Paper>
        )}

        {dataForm ? (
          <FeaturedDocumentCard
            listingId={listingId}
            document={dataForm}
            title="Data Form — Residential"
            description="Filled UAR residential data form generated from MLS intake."
          />
        ) : null}
      </Stack>

      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          All documents
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
                    <TableCell>
                      {doc.name}
                      {isListingAgreementDocument(doc.name) ||
                      isDataFormResidentialDocument(doc.name) ? (
                        <Typography
                          component="span"
                          variant="caption"
                          color="primary"
                          sx={{ ml: 1 }}
                        >
                          Key doc
                        </Typography>
                      ) : null}
                    </TableCell>
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
                        onClick={() => setDeleteTarget(doc)}
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
            <Typography variant="body2" color="text.secondary">
              PDF, JPEG, PNG, or WebP up to {MAX_DOCUMENT_MB} MB.
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
              startIcon={
                docUploading ? <CircularProgress size={18} /> : <UploadFileOutlinedIcon />
              }
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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete document?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `Remove “${deleteTarget.name}” from this listing? This cannot be undone.`
              : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={() => void handleConfirmDelete()} disabled={isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
